import { useState, useEffect } from 'react';
import { Palette, X, Check } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const THEME_COLORS = [
    { name: 'Default', value: 'default', primary: '#FFFFFF', hover: '#F3F4F6', text: '#1F2937', border: '#E5E7EB' },
    { name: 'Indigo', value: 'indigo', primary: '#4F46E5', hover: '#4338CA', text: '#FFFFFF', border: '#4F46E5' },
    { name: 'Blue', value: 'blue', primary: '#3B82F6', hover: '#2563EB', text: '#FFFFFF', border: '#3B82F6' },
    { name: 'Purple', value: 'purple', primary: '#9333EA', hover: '#7C3AED', text: '#FFFFFF', border: '#9333EA' },
    { name: 'Pink', value: 'pink', primary: '#EC4899', hover: '#DB2777', text: '#FFFFFF', border: '#EC4899' },
    { name: 'Red', value: 'red', primary: '#EF4444', hover: '#DC2626', text: '#FFFFFF', border: '#EF4444' },
    { name: 'Orange', value: 'orange', primary: '#F97316', hover: '#EA580C', text: '#FFFFFF', border: '#F97316' },
    { name: 'Amber', value: 'amber', primary: '#F59E0B', hover: '#D97706', text: '#FFFFFF', border: '#F59E0B' },
    { name: 'Green', value: 'green', primary: '#10B981', hover: '#059669', text: '#FFFFFF', border: '#10B981' },
    { name: 'Teal', value: 'teal', primary: '#14B8A6', hover: '#0D9488', text: '#FFFFFF', border: '#14B8A6' },
    { name: 'Cyan', value: 'cyan', primary: '#06B6D4', hover: '#0891B2', text: '#FFFFFF', border: '#06B6D4' },
];

export default function ThemePreferencesModal({ isOpen, onClose }) {
    const [selectedTheme, setSelectedTheme] = useState('default');
    const [currentTheme, setCurrentTheme] = useState('default');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('appTheme') || 'default';
        setSelectedTheme(savedTheme);
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (themeName) => {
        const theme = THEME_COLORS.find(t => t.value === themeName);
        if (theme) {
            document.documentElement.style.setProperty('--theme-primary', theme.primary);
            document.documentElement.style.setProperty('--theme-hover', theme.hover);
            document.documentElement.style.setProperty('--theme-text', theme.text);
            document.documentElement.style.setProperty('--theme-border', theme.border);
            document.documentElement.setAttribute('data-theme', themeName);
        }
    };

    const handleThemeSelect = (themeValue) => {
        setSelectedTheme(themeValue);
    };

    const handleSaveClick = () => {
        if (selectedTheme !== currentTheme) {
            setShowConfirm(true);
        }
    };

    const handleConfirmSave = () => {
        localStorage.setItem('appTheme', selectedTheme);
        setCurrentTheme(selectedTheme);
        applyTheme(selectedTheme);
        setShowConfirm(false);
        onClose();
    };

    if (!isOpen) return null;

    const selectedThemeObj = THEME_COLORS.find(t => t.value === selectedTheme);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-2xl flex flex-col bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
                    {/* Header */}
                    <header className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Palette className="text-gray-500" size={20} />
                            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Theme Preferences</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </header>

                    {/* Main Content */}
                    <main className="p-6 flex-grow overflow-y-auto">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Choose Your Theme Color</h3>
                                <p className="text-xs text-gray-600 mb-4">
                                    Select a color theme that will be applied throughout the system
                                </p>
                            </div>

                            {/* Color Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {THEME_COLORS.map((theme) => (
                                    <button
                                        key={theme.value}
                                        onClick={() => handleThemeSelect(theme.value)}
                                        className={`group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${selectedTheme === theme.value
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        {/* Color Circle */}
                                        <div
                                            className="w-12 h-12 rounded-full mb-2 shadow-lg transition-transform group-hover:scale-110 flex items-center justify-center"
                                            style={{
                                                backgroundColor: theme.primary,
                                                border: theme.value === 'default' ? '2px solid #E5E7EB' : 'none'
                                            }}
                                        >
                                            {selectedTheme === theme.value && (
                                                <Check
                                                    size={24}
                                                    className={theme.value === 'default' ? 'text-gray-900' : 'text-white'}
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </div>
                                        {/* Color Name */}
                                        <span className="text-xs font-medium text-gray-900">{theme.name}</span>

                                        {/* Current Theme Badge */}
                                        {currentTheme === theme.value && (
                                            <span className="absolute top-1 right-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Preview Section */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-700 mb-3">Preview</h4>
                                <div className="space-y-3">
                                    {/* Sample Buttons */}
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                            style={{
                                                backgroundColor: selectedThemeObj?.primary,
                                                color: selectedThemeObj?.text,
                                                border: selectedThemeObj?.value === 'default' ? '1px solid #E5E7EB' : 'none'
                                            }}
                                        >
                                            Primary Button
                                        </button>
                                        <button
                                            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
                                            style={{
                                                color: selectedThemeObj?.value === 'default' ? '#1F2937' : selectedThemeObj?.primary,
                                                borderColor: selectedThemeObj?.border
                                            }}
                                        >
                                            Outline Button
                                        </button>
                                    </div>

                                    {/* Sample Badges */}
                                    <div className="flex gap-2 flex-wrap">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-semibold"
                                            style={{
                                                backgroundColor: selectedThemeObj?.primary,
                                                color: selectedThemeObj?.text,
                                                border: selectedThemeObj?.value === 'default' ? '1px solid #E5E7EB' : 'none'
                                            }}
                                        >
                                            Badge
                                        </span>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-semibold"
                                            style={{
                                                backgroundColor: selectedThemeObj?.value === 'default' ? '#F3F4F6' : `${selectedThemeObj?.primary}20`,
                                                color: selectedThemeObj?.value === 'default' ? '#1F2937' : selectedThemeObj?.primary
                                            }}
                                        >
                                            Light Badge
                                        </span>
                                    </div>

                                    {/* Sample Link */}
                                    <div>
                                        <a
                                            href="#"
                                            className="text-sm font-medium hover:underline"
                                            style={{ color: selectedThemeObj?.value === 'default' ? '#3B82F6' : selectedThemeObj?.primary }}
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            Sample Link Text
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="flex justify-end items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveClick}
                            disabled={selectedTheme === currentTheme}
                            className={`h-9 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm ${selectedTheme === currentTheme
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : ''
                                }`}
                            style={{
                                backgroundColor: selectedTheme === currentTheme
                                    ? undefined
                                    : selectedThemeObj?.primary,
                                color: selectedTheme === currentTheme
                                    ? undefined
                                    : selectedThemeObj?.text,
                                border: selectedTheme !== currentTheme && selectedThemeObj?.value === 'default'
                                    ? '1px solid #E5E7EB'
                                    : 'none'
                            }}
                        >
                            Apply Theme
                        </button>
                    </footer>
                </div>
            </div>

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmSave}
                title="Apply Theme"
                message={`Are you sure you want to change the theme to ${THEME_COLORS.find(t => t.value === selectedTheme)?.name}? This will update the color scheme throughout the entire system.`}
                confirmText="Apply"
                cancelText="Cancel"
                variant="warning"
            />
        </>
    );
}
