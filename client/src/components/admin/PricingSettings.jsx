import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabaseClient';
import {
    DollarSign,
    Save,
    RotateCcw,
    PieChart,
    Zap,
    Droplets,
    Layers,
    Recycle,
    HardDrive
} from 'lucide-react';

const PricingSettings = () => {
    const [pricing, setPricing] = useState({
        base_price: 10,
        wet_waste_rate: 2,
        dry_waste_rate: 1.5,
        mixed_waste_rate: 3,
        recycle_rate: 0.5,
        e_waste_rate: 5,
        gst_percent: 18
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            const { data, error } = await supabase
                .from('pricing_config')
                .select('*')
                .single();

            if (error && error.code !== 'PGRST116') throw error; // Handle empty table
            if (data) setPricing(data);
        } catch (err) {
            console.error('Error fetching pricing:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Check if record exists
            const { count } = await supabase
                .from('pricing_config')
                .select('*', { count: 'exact', head: true });

            let error;
            if (count > 0) {
                ({ error } = await supabase.from('pricing_config').update(pricing).eq('id', pricing.id || 1));
            } else {
                ({ error } = await supabase.from('pricing_config').insert([pricing]));
            }

            if (error) throw error;
            alert('Pricing configuration saved successfully!');
        } catch (err) {
            alert('Save failed: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pricing Engine</h2>
                    <p className="text-slate-500 mt-1">Configure global rates and tax calculations for all services</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchPricing}
                        className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <RotateCcw size={18} /> Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'Syncing...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Base Pricing */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <DollarSign size={100} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Zap size={20} className="text-amber-500" /> Fundamental Rates
                    </h3>
                    <div className="space-y-6">
                        <PriceInput
                            label="Standard Base Price"
                            value={pricing.base_price}
                            onChange={(v) => setPricing({ ...pricing, base_price: v })}
                            unit="/ request"
                        />
                        <PriceInput
                            label="GST Taxation"
                            value={pricing.gst_percent}
                            onChange={(v) => setPricing({ ...pricing, gst_percent: v })}
                            unit="%"
                        />
                    </div>
                </div>

                {/* Waste Type Surcharges */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-indigo-500" /> Category Surcharges (per KG)
                    </h3>
                    <div className="space-y-6">
                        <PriceInput
                            label="Wet Waste"
                            icon={<Droplets size={16} className="text-blue-500" />}
                            value={pricing.wet_waste_rate}
                            onChange={(v) => setPricing({ ...pricing, wet_waste_rate: v })}
                        />
                        <PriceInput
                            label="Dry Waste"
                            icon={<Layers size={16} className="text-slate-500" />}
                            value={pricing.dry_waste_rate}
                            onChange={(v) => setPricing({ ...pricing, dry_waste_rate: v })}
                        />
                        <PriceInput
                            label="Mixed Waste"
                            icon={<Zap size={16} className="text-amber-500" />}
                            value={pricing.mixed_waste_rate}
                            onChange={(v) => setPricing({ ...pricing, mixed_waste_rate: v })}
                        />
                        <PriceInput
                            label="Recyclables"
                            icon={<Recycle size={16} className="text-emerald-500" />}
                            value={pricing.recycle_rate}
                            onChange={(v) => setPricing({ ...pricing, recycle_rate: v })}
                        />
                        <PriceInput
                            label="E-Waste"
                            icon={<HardDrive size={16} className="text-purple-500" />}
                            value={pricing.e_waste_rate}
                            onChange={(v) => setPricing({ ...pricing, e_waste_rate: v })}
                        />
                    </div>
                </div>
            </div>

            {/* Pricing Preview Info */}
            <div className="mt-8 bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h4 className="font-bold text-lg">Dynamic Pricing Preview</h4>
                    <p className="text-slate-400 text-sm mt-1">Example: 10kg Mix Waste Request</p>
                </div>
                <div className="flex gap-8 items-center">
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Subtotal</p>
                        <p className="text-xl font-mono">₹{(pricing.base_price + (10 * pricing.mixed_waste_rate)).toFixed(2)}</p>
                    </div>
                    <div className="text-2xl text-slate-700">+</div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">GST ({pricing.gst_percent}%)</p>
                        <p className="text-xl font-mono text-emerald-400">
                            ₹{((pricing.base_price + (10 * pricing.mixed_waste_rate)) * (pricing.gst_percent / 100)).toFixed(2)}
                        </p>
                    </div>
                    <div className="h-10 w-px bg-slate-800"></div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Estimated Total</p>
                        <p className="text-3xl font-black text-indigo-400">
                            ₹{((pricing.base_price + (10 * pricing.mixed_waste_rate)) * (1 + pricing.gst_percent / 100)).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PriceInput = ({ label, value, onChange, unit = "/ kg", icon }) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                {icon} {label}
            </label>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold group-focus-within:text-indigo-500 transition-colors">₹</span>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-16 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">{unit}</span>
            </div>
        </div>
    );
};

export default PricingSettings;
