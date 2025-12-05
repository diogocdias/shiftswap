import { useState, useRef, useEffect } from 'react';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    employeeId: string;
    facility: string;
    startDate: string;
    profilePicture: string | null;
}

// TODO: REMOVE THIS MOCK API WHEN BACKEND IS READY
// This simulates the backend API response for user profile data
const mockFetchUserProfile = async (userId: string): Promise<UserProfile> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get user data from sessionStorage (simulating session-based user identification)
    const userDataString = sessionStorage.getItem('mockUser');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    console.log('Fetching profile for user:', userId); // TODO: Remove this log

    // Mock API response - in real implementation, this would come from backend
    return {
        name: userData?.name || 'User',
        email: userData?.email || '',
        phone: userData?.phone || '+1 (555) 123-4567',
        role: userData?.role || 'user',
        department: userData?.department || 'Emergency Department',
        employeeId: userData?.employeeId || 'EMP-001234',
        facility: userData?.facility || 'Memorial Hospital',
        startDate: userData?.startDate || '2023-06-15',
        profilePicture: userData?.profilePicture || null,
    };
};
// END TODO

function ProfileTab() {
    // Get user data from sessionStorage for user identification
    const userDataString = sessionStorage.getItem('mockUser');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

    // Fetch profile data on component mount
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                // TODO: REPLACE WITH ACTUAL API CALL
                // const response = await fetch('/api/users/profile', {
                //     method: 'GET',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'Authorization': `Bearer ${userData?.sessionId}`
                //     }
                // });
                // const profileData = await response.json();

                const profileData = await mockFetchUserProfile(userData?.email || '');
                // END TODO

                setProfile(profileData);
                setEditedProfile(profileData);
            } catch (error) {
                console.error('Failed to load profile:', error);
                setLoadError('Failed to load profile. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [userData?.email]);

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - revert changes
            setEditedProfile(profile);
        }
        setIsEditing(!isEditing);
        setSaveSuccess(false);
    };

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        setEditedProfile(prev => prev ? ({
            ...prev,
            [field]: value
        }) : null);
    };

    const handleSave = async () => {
        if (!editedProfile) return;

        setIsSaving(true);
        setSaveSuccess(false);

        // TODO: REPLACE WITH ACTUAL API CALL
        // await fetch('/api/users/profile', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${userData?.sessionId}`
        //     },
        //     body: JSON.stringify(editedProfile)
        // });

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // END TODO

        // Update profile state
        setProfile(editedProfile);

        // Update sessionStorage with new user data
        const updatedUserData = {
            ...userData,
            name: editedProfile.name,
            email: editedProfile.email,
            phone: editedProfile.phone,
            department: editedProfile.department,
            facility: editedProfile.facility,
            profilePicture: editedProfile.profilePicture,
        };
        sessionStorage.setItem('mockUser', JSON.stringify(updatedUserData));

        setIsSaving(false);
        setIsEditing(false);
        setSaveSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleProfilePictureClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            // Read file and convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setEditedProfile(prev => prev ? ({
                    ...prev,
                    profilePicture: base64String
                }) : null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveProfilePicture = () => {
        setEditedProfile(prev => prev ? ({
            ...prev,
            profilePicture: null
        }) : null);
    };

    const handleRetry = () => {
        setIsLoading(true);
        setLoadError(null);
        mockFetchUserProfile(userData?.email || '')
            .then(profileData => {
                setProfile(profileData);
                setEditedProfile(profileData);
            })
            .catch(error => {
                console.error('Failed to load profile:', error);
                setLoadError('Failed to load profile. Please try again.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const getRoleDisplayName = (role: string) => {
        const roleNames: Record<string, string> = {
            'admin': 'Administrator',
            'teamleader': 'Team Leader',
            'user': 'Staff Member'
        };
        return roleNames[role] || role;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const currentProfilePicture = isEditing ? editedProfile?.profilePicture : profile?.profilePicture;

    // Loading State
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                {/* Loading Skeleton */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 mb-6 animate-pulse">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar Skeleton */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200" />
                        {/* Info Skeleton */}
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div className="h-8 bg-gray-200 rounded w-48 mx-auto md:mx-0" />
                            <div className="h-4 bg-gray-200 rounded w-64 mx-auto md:mx-0" />
                            <div className="flex gap-2 justify-center md:justify-start">
                                <div className="h-6 bg-gray-200 rounded-full w-24" />
                                <div className="h-6 bg-gray-200 rounded-full w-32" />
                            </div>
                        </div>
                        {/* Button Skeleton */}
                        <div className="h-10 bg-gray-200 rounded-lg w-28" />
                    </div>
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
                            <div className="space-y-4">
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                                    <div className="h-5 bg-gray-200 rounded w-full" />
                                </div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                                </div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error State
    if (loadError || !profile) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Profile</h3>
                    <p className="text-gray-600 mb-6">{loadError || 'Unable to load profile data. Please try again.'}</p>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Success Message */}
            {saveSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800">Profile updated successfully!</span>
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div
                            onClick={handleProfilePictureClick}
                            className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center overflow-hidden ${
                                isEditing ? 'cursor-pointer ring-4 ring-blue-100 hover:ring-blue-200' : ''
                            } ${currentProfilePicture ? '' : 'bg-blue-600'}`}
                        >
                            {currentProfilePicture ? (
                                <img
                                    src={currentProfilePicture}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-3xl md:text-4xl font-semibold">
                                    {getInitials(isEditing && editedProfile ? editedProfile.name : profile.name)}
                                </span>
                            )}
                        </div>
                        {isEditing && editedProfile && (
                            <div className="absolute -bottom-1 -right-1 flex gap-1">
                                <button
                                    onClick={handleProfilePictureClick}
                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-lg"
                                    title="Upload photo"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                                {editedProfile.profilePicture && (
                                    <button
                                        onClick={handleRemoveProfilePicture}
                                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg"
                                        title="Remove photo"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile Info Header */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {profile.name}
                        </h2>
                        <p className="text-gray-600 mt-1">{profile.email}</p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {getRoleDisplayName(profile.role)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                {profile.department}
                            </span>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleEditToggle}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEditToggle}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Full Name
                            </label>
                            {isEditing && editedProfile ? (
                                <input
                                    type="text"
                                    value={editedProfile.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Email Address
                            </label>
                            {isEditing && editedProfile ? (
                                <input
                                    type="email"
                                    value={editedProfile.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Phone Number
                            </label>
                            {isEditing && editedProfile ? (
                                <input
                                    type="tel"
                                    value={editedProfile.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.phone}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Work Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Work Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Employee ID
                            </label>
                            <p className="text-gray-900">{profile.employeeId}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Role
                            </label>
                            <p className="text-gray-900">{getRoleDisplayName(profile.role)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Department
                            </label>
                            {isEditing && editedProfile ? (
                                <select
                                    value={editedProfile.department}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Emergency Department">Emergency Department</option>
                                    <option value="Intensive Care Unit">Intensive Care Unit</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Oncology">Oncology</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="General Medicine">General Medicine</option>
                                </select>
                            ) : (
                                <p className="text-gray-900">{profile.department}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Facility Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Facility Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Healthcare Facility
                            </label>
                            {isEditing && editedProfile ? (
                                <input
                                    type="text"
                                    value={editedProfile.facility}
                                    onChange={(e) => handleInputChange('facility', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.facility}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Start Date
                            </label>
                            <p className="text-gray-900">
                                {new Date(profile.startDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Account Settings
                    </h3>
                    <div className="space-y-4">
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span className="text-gray-700 font-medium">Change Password</span>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="text-gray-700 font-medium">Notification Preferences</span>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-gray-700 font-medium">Privacy Settings</span>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileTab;
