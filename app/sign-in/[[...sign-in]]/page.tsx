import checkUser from '@/lib/checkUser'
import { SignIn } from '@clerk/nextjs'

export default async function Page() {
  try{
  var user = await checkUser();
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-screen">
      <SignIn/>
      </div>
    )
  }

  if (!user) {
    return <div className='text-red-400'>You are not signed in.</div>
  } 

  
  return <SignIn />
}