import { useForm, Link, Head } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post('/register', {
            onSuccess: () => reset(),
        })
    }

    return (
        <>
            <Head title="Register" />
            <div className="w-full">
                <h4 className="text-xl font-semibold text-text-heading dark:text-text-heading-dark mb-1 text-center">
                    Adventure starts here 🚀
                </h4>
                <p className="text-sm text-text-muted dark:text-text-muted-dark mb-8 text-center">
                    Make your app management easy and fun!
                </p>

                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label htmlFor="name" className="form-label-sneat">Username</label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="form-control-sneat"
                            placeholder="Enter your username"
                            autoFocus
                        />
                        <AnimatePresence>
                            {errors.name && (
                                <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-expense text-xs mt-1.5">
                                    {errors.name}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div>
                        <label htmlFor="email" className="form-label-sneat">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="form-control-sneat"
                            placeholder="Enter your email"
                        />
                        <AnimatePresence>
                            {errors.email && (
                                <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-expense text-xs mt-1.5">
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
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="form-control-sneat"
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                        />
                        <AnimatePresence>
                            {errors.password && (
                                <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-expense text-xs mt-1.5">
                                    {errors.password}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="form-label-sneat">Confirm Password</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="form-control-sneat"
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                        />
                        <AnimatePresence>
                            {errors.password_confirmation && (
                                <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-expense text-xs mt-1.5">
                                    {errors.password_confirmation}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={processing}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary-sneat w-full py-2.5 text-sm font-semibold"
                    >
                        {processing ? 'Creating account...' : 'Register'}
                    </motion.button>
                </motion.form>

                <p className="text-center text-sm text-text-muted dark:text-text-muted-dark mt-8">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary-dark font-semibold">Sign in instead</Link>
                </p>
            </div>
        </>
    )
}
