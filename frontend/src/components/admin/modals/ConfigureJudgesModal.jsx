import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserCircle, X, Plus, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function ConfigureJudgesModal({ isOpen, onClose, eventId }) {
    const [judges, setJudges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, judgeId: null, judgeName: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        chair_number: '',
        status: 'active'
    });

    useEffect(() => {
        if (isOpen && eventId) {
            fetchJudges();
        }
    }, [isOpen, eventId]);

    const fetchJudges = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/judges?event_id=${eventId}`);
            if (!response.ok) throw new Error('Failed to fetch judges');
            const data = await response.json();
            setJudges(data);
        } catch (error) {
            console.error('Error fetching judges:', error);
            toast.error('Failed to load judges');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `http://localhost:8000/api/judges/${editingId}`
                : 'http://localhost:8000/api/judges';

            const method = editingId ? 'PUT' : 'POST';

            const body = {
                ...formData,
                event_id: eventId,
                chair_number: parseInt(formData.chair_number) || (judges.length + 1)
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Failed to save judge');

            toast.success(editingId ? 'Judge updated successfully' : 'Judge added successfully');
            fetchJudges();
            resetForm();
        } catch (error) {
            console.error('Error saving judge:', error);
            toast.error('Failed to save judge');
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/api/judges/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete judge');

            toast.success('Judge deleted successfully');
            fetchJudges();
            setDeleteConfirm({ isOpen: false, judgeId: null, judgeName: '' });
        } catch (error) {
            console.error('Error deleting judge:', error);
            toast.error('Failed to delete judge');
        }
    };

    const openDeleteConfirm = (judge) => {
        setDeleteConfirm({
            isOpen: true,
            judgeId: judge.id,
            judgeName: judge.name
        });
    };

    const startEdit = (judge) => {
        setFormData({
            name: judge.name,
            chair_number: judge.chair_number,
            status: judge.status
        });
        setEditingId(judge.id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            chair_number: '',
            status: 'active'
        });
        setEditingId(null);
        setIsAdding(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-2xl flex flex-col bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
                    <header className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <UserCircle className="text-gray-500" size={20} />
                            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Configure Judges</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </header>

                    <main className="p-6 flex-grow overflow-y-auto">
                        <div className="space-y-6">
                            {!isAdding ? (
                                <div className="flex justify-between items-center">
                                    <h3 className="text-base font-semibold text-gray-900">Current Judges</h3>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="h-9 px-4 flex items-center gap-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <Plus size={18} />
                                        <span>Add New Judge</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {editingId ? 'Edit Judge' : 'Add New Judge'}
                                    </h3>
                                    <button
                                        onClick={resetForm}
                                        className="text-sm text-gray-500 hover:text-gray-900 underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {isAdding && (
                                <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Judge Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                placeholder="Enter judge name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Chair Number</label>
                                            <input
                                                type="number"
                                                name="chair_number"
                                                value={formData.chair_number}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                placeholder="e.g. 1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            >
                                                <option value="active">Active</option>
                                                <option value="idle">Idle</option>
                                                <option value="locked">Locked</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            className="h-9 px-5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                                        >
                                            {editingId ? 'Update Judge' : 'Save Judge'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-500 uppercase text-xs bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold tracking-wider" scope="col">Chair #</th>
                                            <th className="px-6 py-3 font-semibold tracking-wider" scope="col">Judge Name</th>
                                            <th className="px-6 py-3 font-semibold tracking-wider" scope="col">Status</th>
                                            <th className="px-6 py-3 font-semibold tracking-wider text-center" scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-900 divide-y divide-gray-200">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                    Loading judges...
                                                </td>
                                            </tr>
                                        ) : judges.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                    No judges found. Add one to get started.
                                                </td>
                                            </tr>
                                        ) : (
                                            judges.map((judge) => (
                                                <tr key={judge.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500 font-medium">#{judge.chair_number}</td>
                                                    <td className="px-6 py-4 font-medium">{judge.name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${judge.status === 'active'
                                                                ? 'bg-green-100 text-green-700'
                                                                : judge.status === 'locked'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            <span className={`size-1.5 rounded-full ${judge.status === 'active'
                                                                    ? 'bg-green-500'
                                                                    : judge.status === 'locked'
                                                                        ? 'bg-red-500'
                                                                        : 'bg-gray-500'
                                                                }`}></span>
                                                            {judge.status.charAt(0).toUpperCase() + judge.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => startEdit(judge)}
                                                                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteConfirm(judge)}
                                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>

                    <footer className="flex justify-end items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Close
                        </button>
                    </footer>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, judgeId: null, judgeName: '' })}
                onConfirm={() => handleDelete(deleteConfirm.judgeId)}
                title="Delete Judge"
                message={`Are you sure you want to delete ${deleteConfirm.judgeName}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}
