import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(()=>{
        auth.onAuthStateChanged((user)=>{
            if(user){
                navigate('/')
            }
        })
    })

    async function login()
    {
        if(email=='' || password==''){
            alert('Please fill all fields')
            return;
        }
        setLoading(true)
        await signInWithEmailAndPassword(auth, email, password).then(()=>{
            alert('Login Successful')
            setLoading(false)
            navigate('/')
        }).catch(()=>{
            alert('Login Failed, PLease try again')
            setLoading(false)
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-10">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-10 shadow-xl sm:px-12 sm:py-12">

                <div className="relative z-10">
                    <Link to="/" className="mb-10 flex items-center justify-center gap-2">
                        <i className="fa-solid fa-basket-shopping text-2xl text-[#245C45]" />
                        <h1 className="text-2xl font-bold">Buy2<span className="text-[#173B2E]">Basket</span></h1>
                    </Link>

                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-[#173B2E]">Welcome</h2>
                        <p className="mt-3 text-sm leading-6 text-gray-500">Log in to your account and continue shopping.</p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#245C45] focus-within:ring-2 focus-within:ring-green-100">
                                <i className="fa-regular fa-envelope text-lg text-[#245C45]" />
                                <input type="email" placeholder="Enter your email address" required value={email} onChange={(e)=>setEmail(e.target.value)}
                                    className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                            <div className="flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#245C45] focus-within:ring-2 focus-within:ring-green-100">
                                <i className="fa-solid fa-lock text-lg text-[#245C45]" />
                                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" required value={password} onChange={(e)=>setPassword(e.target.value)}
                                    className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-gray-400"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-[#245C45]">
                                    <i className={`fa-regular ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
                                </button>
                            </div>
                        </div>

                        <button onClick={login} type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#245C45] py-3.5 font-semibold text-white transition hover:bg-[#173B2E] focus:outline-none focus:ring-4 focus:ring-green-200">
                            {loading ? 'Loading...':'Login'}<i className="fa-solid fa-arrow-right" />
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        Don't have an account?{" "}
                        <Link to="/signup" className="ml-1 font-semibold text-[#245C45] hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;