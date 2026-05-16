import {
    Wallet, Code2, Gift, TrendingUp, UtensilsCrossed, Car,
    ShoppingBag, FileText, Gamepad2, HeartPulse, MoreHorizontal,
    BookOpen, Shield, Smartphone, HandHeart, Shirt, Sparkles,
    Tv, Home, Receipt, Building2, DollarSign, Medal, Clock, Feather
} from 'lucide-react'

const categoryConfig = {
    income: [
        { value: 'gaji', icon: Wallet, color: 'badge-income', label: 'Gaji' },
        { value: 'freelance', icon: Code2, color: 'badge-income', label: 'Freelance' },
        { value: 'bisnis', icon: Building2, color: 'badge-income', label: 'Bisnis' },
        { value: 'penjualan', icon: DollarSign, color: 'badge-income', label: 'Penjualan' },
        { value: 'investasi', icon: TrendingUp, color: 'badge-income', label: 'Investasi' },
        { value: 'dividen', icon: Feather, color: 'badge-income', label: 'Dividen' },
        { value: 'bonus', icon: Medal, color: 'badge-income', label: 'Bonus' },
        { value: 'thr', icon: Gift, color: 'badge-income', label: 'THR' },
        { value: 'lembur', icon: Clock, color: 'badge-income', label: 'Lembur' },
        { value: 'royalti', icon: Sparkles, color: 'badge-income', label: 'Royalti' },
        { value: 'hadiah', icon: Gift, color: 'badge-income', label: 'Hadiah' },
    ],
    expense: [
        { value: 'makan', icon: UtensilsCrossed, color: 'badge-expense', label: 'Makan' },
        { value: 'transport', icon: Car, color: 'badge-expense', label: 'Transport' },
        { value: 'belanja', icon: ShoppingBag, color: 'badge-expense', label: 'Belanja' },
        { value: 'tagihan', icon: FileText, color: 'badge-expense', label: 'Tagihan' },
        { value: 'hiburan', icon: Gamepad2, color: 'badge-expense', label: 'Hiburan' },
        { value: 'kesehatan', icon: HeartPulse, color: 'badge-expense', label: 'Kesehatan' },
        { value: 'pendidikan', icon: BookOpen, color: 'badge-expense', label: 'Pendidikan' },
        { value: 'asuransi', icon: Shield, color: 'badge-expense', label: 'Asuransi' },
        { value: 'pulsa', icon: Smartphone, color: 'badge-expense', label: 'Pulsa' },
        { value: 'donasi', icon: HandHeart, color: 'badge-expense', label: 'Donasi' },
        { value: 'pakaian', icon: Shirt, color: 'badge-expense', label: 'Pakaian' },
        { value: 'perawatan', icon: Sparkles, color: 'badge-expense', label: 'Perawatan' },
        { value: 'elektronik', icon: Tv, color: 'badge-expense', label: 'Elektronik' },
        { value: 'rumah', icon: Home, color: 'badge-expense', label: 'Rumah' },
        { value: 'pajak', icon: Receipt, color: 'badge-expense', label: 'Pajak' },
    ],
}

const allCategories = [...categoryConfig.income, ...categoryConfig.expense]

const categoryMap = Object.fromEntries(allCategories.map((c) => [c.value, c]))

const fallback = { icon: MoreHorizontal, color: 'badge-neutral', label: 'Lainnya' }

export default function CategoryBadge({ category }) {
    const config = categoryMap[category] || fallback
    const Icon = config.icon

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    )
}

export { categoryConfig as allCategories }
