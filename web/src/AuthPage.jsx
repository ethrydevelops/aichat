function AuthPage({ authType }) {
    return (
        <>
            <div className="full-center-blur-behind"></div>
            <div className="full-center">
                {authType == "login" ? (
                    <h1>sign in page</h1>
                ) : (
                    <h1>Sign up page</h1>
                )}
            </div>
        </>
    )
}

export default AuthPage;
