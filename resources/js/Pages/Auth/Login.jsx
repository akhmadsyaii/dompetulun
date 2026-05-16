import { useForm, Link, Head } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post('/login', {
            onSuccess: () => reset('password'),
        })
    }

    return (
        <>
            <Head title="Login" />
            <div className="w-full">
                <h4 className="text-xl font-semibold text-text-heading dark:text-text-heading-dark mb-1 text-center">
                    Welcome to Dompetulun! 👋
                </h4>
                <p className="text-sm text-text-muted dark:text-text-muted-dark mb-8 text-center">
                    Please sign-in to your account and start the adventure
                </p>

                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label htmlFor="email" className="form-label-sneat">Email or Username</label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="form-control-sneat"
                            placeholder="Enter your email or username"
                            autoComplete="email"
                            autoFocus
                        />
                        <AnimatePresence>
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-expense text-xs mt-1.5"
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div>
                        <label htmlFor="password" className="form-label-sneat">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="form-control-sneat"
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                        />
                        <AnimatePresence>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-expense text-xs mt-1.5"
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="form-check-sneat">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span>Remember Me</span>
                        </label>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={processing}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary-sneat w-full py-2.5 text-sm font-semibold"
                    >
                        {processing ? 'Signing in...' : 'Login'}
                    </motion.button>
                </motion.form>

                <p className="text-center text-sm text-text-muted dark:text-text-muted-dark mt-8">
                    New on our platform?{' '}
                    <Link href="/register" className="text-primary hover:text-primary-dark font-semibold">Create an account</Link>
                </p>
            </div>
        </>
    )
}
