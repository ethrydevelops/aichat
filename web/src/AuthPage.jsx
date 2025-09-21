import { SignIn, SignUp } from '@clerk/clerk-react'

function AuthPage({ authType }) {
    return (
        <>
            <div className="full-center-blur-behind"></div>
            <div className="full-center">
                {authType == "login" ? (
                    <SignIn signUpUrl="/signup"></SignIn>
                ) : (
                    <SignUp signInUrl="/login"></SignUp>
                )}
            </div>
        </>
    )
}

export default AuthPage;
