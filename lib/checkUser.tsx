import { currentUser } from "@clerk/nextjs/server";
import {db } from "./db";

const checkUser = async () => {
  const user = await currentUser();
 
    if (!user) {    
        throw new Error("User not found");          
    }

    let dbUser = await db.user.findFirst({
        where: {
            clerkUserId: user.id
        }
    }); 

    if (!dbUser) {
        dbUser = await db.user.create({
            data: { clerkUserId: user.id, 
                  name: `${user.firstName} ${user.lastName}`,
                  imageUrl: user.imageUrl,
                    email: user.emailAddresses[0]?.emailAddress,
             }
        });
    }   
    return { ...user, id: dbUser.id };
}

export default checkUser;