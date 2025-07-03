import { db } from '../helper/db';
import { users, User, InsertUser } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { comparePassword, generateToken, hashPassword } from '../helper/auth';
import { RequestHandler } from 'express';
import admin, { ServiceAccount } from 'firebase-admin'; 
import serviceAccount from '../data/SOAI.json'; // Make sure this path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});
export const registerUser : RequestHandler = async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;
  
      // Check if email already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
         res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
  
      // Hash password
      const hashedPassword = await hashPassword(password);
  
      // Create new user
      const newUser: InsertUser = {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'user' // Default role
      };
  
      const [createdUser] = await db.insert(users).values(newUser).returning();
  
      // Generate token
      const token = generateToken(createdUser.id, createdUser.email, createdUser.role);
  
      // Return user without password
      const { password: _, ...userWithoutPassword } = createdUser;
  
       res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user: userWithoutPassword, token }
      });
    } catch (error) {
      console.error('Register error:', error);
       res.status(500).json({
        success: false,
        message: 'Server error while registering user'
      });
    }
  };
export const loginUser: RequestHandler = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      if (!user) {
         res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
  
      // Check if password is correct
      const isPasswordValid = await comparePassword(password, user.password);
      
      if (!isPasswordValid) {
         res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
  
      // Generate token
      const token = generateToken(user.id, user.email, user.role);
      // Return user without password
      const firebaseUid = user.email; // Or a property in your user object that is unique

      const firebaseCustomToken = await admin.auth().createCustomToken(firebaseUid, {
          // Optional: You can include custom claims here if you want to store
          // additional, non-sensitive user data directly in the token.
          // These claims will be available in Firebase's ID token on the frontend.
          email: user.email,
          role: user.role, // Example: include user role
      });

      // 4. Return user data (without password) and the Firebase Custom Token
      const { password: _, ...userWithoutPassword } = user;
      
      
     res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user: { 
          token:firebaseCustomToken,
          uid: firebaseUid, // Crucial: Send the Firebase UID to the frontend
          ...userWithoutPassword 
      },  firebaseCustomToken }
      });
    } catch (error) {
      console.error('Login error:', error);
       res.status(500).json({
        success: false,
        message: 'Server error while logging in'
      });
    }
  };
  
//   export const getUserProfile = async (req: express.Request, res: express.Response) => {
//     try {
//       const userId = req.user?.id;
//       console.log("userId"+userId)
//       if (!userId) {
//         return res.status(401).json({
//           success: false,
//           message: 'Unauthorized access'
//         });
//       }
  
//       const [user] = await db.select().from(users).where(eq(users.id, userId));
  
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: 'User not found'
//         });
//       }
  
//       // Return user without password
//       const { password, ...userWithoutPassword } = user;
  
//       return res.status(200).json({
//         success: true,
//         data: userWithoutPassword
//       });
//     } catch (error) {
//       console.error('Get profile error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Server error while fetching user profile'
//       });
//     }
//   };
  