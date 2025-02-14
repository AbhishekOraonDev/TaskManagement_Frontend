
import { useEffect, useState } from "react";
import axios from "axios";
import pic1 from "../assets/pic1.png"

interface User {
    _id: string;
    userName: string;
    userEmail: string;
    avatar?: string;
}

interface TaskStats {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
}

interface ProfileData {
    user: User;
    taskStats: TaskStats;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get<{ status: string; data: ProfileData }>(
                    `https://taskmanagement-backend-uxtd.onrender.com/api/user/profile`,
                    { withCredentials: true }
                );
                setProfile(response.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen w-full bg-white dark:bg-dot-black/[0.2] bg-dot-black/[0.2]">
            <div className="max-w-4xl mx-auto p-4 pt-24"></div>
            <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
                <div className="flex items-center space-x-4">
                    {pic1 ? (
                        <img
                            src={pic1}
                            alt="Profile Avatar"
                            className="w-16 h-16 rounded-full"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-700 text-xl">
                                {profile?.user?.userName ? profile.user.userName.charAt(0).toUpperCase() : "U"}
                            </span>
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-semibold">{profile?.user?.userName || "Unknown User"}</h2>
                        <p className="text-gray-600">{profile?.user?.userEmail || "No email available"}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold">Task Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="p-4 bg-blue-100 rounded-lg text-center">
                            <p className="text-lg font-bold">{profile?.taskStats?.totalTasks ?? 0}</p>
                            <p className="text-gray-600">Total Tasks</p>
                        </div>
                        <div className="p-4 bg-green-100 rounded-lg text-center">
                            <p className="text-lg font-bold">{profile?.taskStats?.completedTasks ?? 0}</p>
                            <p className="text-gray-600">Completed</p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded-lg text-center">
                            <p className="text-lg font-bold">{profile?.taskStats?.inProgressTasks ?? 0}</p>
                            <p className="text-gray-600">In Progress</p>
                        </div>
                        <div className="p-4 bg-red-100 rounded-lg text-center">
                            <p className="text-lg font-bold">{profile?.taskStats?.pendingTasks ?? 0}</p>
                            <p className="text-gray-600">Pending</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
