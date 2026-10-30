import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import axios from 'axios'

function Signup() {
    const [name, setname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate()

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                navigate('/')
            }
        })
    })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function sendOTP() {
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            alert("Password and confirm password do not match");
            return;
        }

        try {
            setLoading(true);

            await axios.post(`${process.env.REACT_APP_API_URL}/send-signup-otp`, { email })

            setOtpSent(true);
            setOtpVerified(false);
            alert("OTP sent to your email!");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function verifyOTP() {
        if (!/^\d{6}$/.test(otp)) {
            alert("Please enter the 6-digit OTP");
            return;
        }

        if (password !== confirmPassword) {
            alert('Paasword and confirm password are not same')
            return
        }

        if (password !== confirmPassword) {
            alert('Paasword and confirm password are not same')
            return
        }

        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);

            await axios.post(`${process.env.REACT_APP_API_URL}/verify-signup-otp`, { email, otp })

            const user = await createUserWithEmailAndPassword(auth, email, password)

            await updateProfile(user.user, {
                displayName: name
            })
            setOtpVerified(true);
            alert('Account created successfully')
            navigate('/login')
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-8">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-xl sm:px-12 sm:py-10">

                <div className="relative z-10">
                    <Link to="/" className="mb-6 flex items-center justify-center gap-3">
                        <i className="fa-solid fa-basket-shopping text-4xl text-[#245C45]" />
                        <h1 className="text-2xl font-bold text-[#173B2E]">Buy2Basket</h1>
                    </Link>

                    <div className="mb-6 text-center">
                        <h2 className="text-3xl font-bold text-[#173B2E]">Create Account</h2>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#245C45] focus-within:ring-2 focus-within:ring-green-100">
                                <i className="fa-regular fa-user text-[#245C45]" />
                                <input type="text" placeholder="Enter your full name" required value={name} onChange={(e) => setname(e.target.value)}
                                    className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#245C45] focus-within:ring-2 focus-within:ring-green-100">
                                <i className="fa-regular fa-envelope text-[#245C45]" />
                                <input type="email" placeholder="Enter your email address" required value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setOtp("");
                                        setOtpSent(false);
                                        setOtpVerified(false);
                                    }}
                                    className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                            <div className="flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#245C45] focus-within:ring-2 focus-within:ring-green-100">
                                <i className="fa-solid fa-lock text-[#245C45]" />
                                <input type={showPassword ? "text" : "password"} placeholder="Create a password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-[#245C45]">
                                    <i className={`fa-regular ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#245C45] focus-within:ring-2 focus-within:ring-green-100">
                                <i className="fa-solid fa-lock text-[#245C45]" />
                                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 hover:text-[#245C45]">
                                    <i className={`fa-regular ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`} />
                                </button>
                            </div>
                        </div>

                        {!otpSent && (
                            <button
                                type="button"
                                onClick={sendOTP}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#245C45] py-3.5 font-semibold text-white transition hover:bg-[#173B2E] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Sending OTP..." : "Send Email OTP"}
                                <i className="fa-solid fa-envelope" />
                            </button>
                        )}

                        {otpSent && !otpVerified && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Enter the 6-digit OTP sent to your email.
                                </p>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#245C45] focus:ring-2 focus:ring-green-100"
                                />

                                <button
                                    type="button"
                                    onClick={verifyOTP}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-[#245C45] py-3.5 font-semibold text-white transition hover:bg-[#173B2E] disabled:opacity-60"
                                >
                                    {loading ? "Verifying OTP..." : "Verify OTP an Create Acccount"}
                                </button>
                            </div>
                        )}
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="ml-1 font-semibold text-[#245C45] hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;