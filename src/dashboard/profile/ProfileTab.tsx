import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { UserProfile, LanguageCode } from '../../types/domain';
import { getUser, updateUser } from '../../services/sessionService';
import { fetchUserProfile, saveUserProfile } from '../../services/api/profileService';
import { UI_TIMING } from '../../config/constants';
import { useToast } from '../../context/ToastContext';
import { SUPPORTED_LANGUAGES, changeLanguage, getCurrentLanguage } from '../../i18n';

function ProfileTab() {
    const { t, i18n } = useTranslation();
    // Get user data from session service for user identification
    const userData = getUser();
    const { showError, showWarning } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(getCurrentLanguage() as LanguageCode);

    // Fetch profile data on component mount
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const profileData = await fetchUserProfile(userData?.email || '');
                setProfile(profileData);
                setEditedProfile(profileData);
                if (profileData.language) {
                    setSelectedLanguage(profileData.language);
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
                setLoadError(t('profile.failedToLoadDescription'));
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [userData?.email, t]);

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - revert changes
            setEditedProfile(profile);
            setSelectedLanguage(profile?.language || getCurrentLanguage() as LanguageCode);
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

    const handleLanguageChange = (newLanguage: LanguageCode) => {
        setSelectedLanguage(newLanguage);
        setEditedProfile(prev => prev ? ({
            ...prev,
            language: newLanguage
        }) : null);
    };

    const handleSave = async () => {
        if (!editedProfile) return;

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            // Include the selected language in the profile
            const profileToSave = {
                ...editedProfile,
                language: selectedLanguage
            };

            const result = await saveUserProfile(profileToSave);

            if (result.success) {
                // Update profile state
                setProfile(profileToSave);

                // Update session with new user data using the session service
                updateUser({
                    name: profileToSave.name,
                    email: profileToSave.email,
                    phone: profileToSave.phone,
                    department: profileToSave.department,
                    facility: profileToSave.facility,
                    profilePicture: profileToSave.profilePicture,
                    language: selectedLanguage,
                });

                // Change the app language
                changeLanguage(selectedLanguage);

                setIsEditing(false);
                setSaveSuccess(true);

                // Hide success message after configured time
                setTimeout(() => setSaveSuccess(false), UI_TIMING.SUCCESS_MESSAGE_DISPLAY);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            showError(t('profile.failedToSave'));
        } finally {
            setIsSaving(false);
        }
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
                showWarning(t('profile.imageValidation.invalidType'));
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showWarning(t('profile.imageValidation.tooLarge'));
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
        fetchUserProfile(userData?.email || '')
            .then(profileData => {
                setProfile(profileData);
                setEditedProfile(profileData);
            })
            .catch(error => {
                console.error('Failed to load profile:', error);
                setLoadError(t('profile.failedToLoadDescription'));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const getRoleDisplayName = (role: string) => {
        return t(`profile.roles.${role}`) || role;
    };

    const getDepartmentDisplayName = (department: string) => {
        const departmentMap: Record<string, string> = {
            'Emergency Department': 'emergency',
            'Intensive Care Unit': 'icu',
            'Pediatrics': 'pediatrics',
            'Surgery': 'surgery',
            'Oncology': 'oncology',
            'Cardiology': 'cardiology',
            'Neurology': 'neurology',
            'General Medicine': 'generalMedicine'
        };
        const key = departmentMap[department];
        return key ? t(`profile.departments.${key}`) : department;
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
            <>
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
                <LoadingOverlay isLoading={isLoading} />
            </>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('profile.failedToLoad')}</h3>
                    <p className="text-gray-600 mb-6">{loadError || t('profile.failedToLoadDescription')}</p>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        {t('common.tryAgain')}
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
                    <span className="text-green-800">{t('profile.profileUpdated')}</span>
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
                                {getDepartmentDisplayName(profile.department)}
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
                                    {t('common.cancel')}
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
                                            {t('profile.saving')}
                                        </>
                                    ) : (
                                        t('profile.saveChanges')
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
                                {t('profile.editProfile')}
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
                        {t('profile.personalInfo.title')}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                {t('profile.personalInfo.fullName')}
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
                                {t('profile.personalInfo.email')}
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
                                {t('profile.personalInfo.phone')}
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
                        {t('profile.workInfo.title')}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                {t('profile.workInfo.employeeId')}
                            </label>
                            <p className="text-gray-900">{profile.employeeId}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                {t('profile.workInfo.role')}
                            </label>
                            <p className="text-gray-900">{getRoleDisplayName(profile.role)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                {t('profile.workInfo.department')}
                            </label>
                            {isEditing && editedProfile ? (
                                <select
                                    value={editedProfile.department}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Emergency Department">{t('profile.departments.emergency')}</option>
                                    <option value="Intensive Care Unit">{t('profile.departments.icu')}</option>
                                    <option value="Pediatrics">{t('profile.departments.pediatrics')}</option>
                                    <option value="Surgery">{t('profile.departments.surgery')}</option>
                                    <option value="Oncology">{t('profile.departments.oncology')}</option>
                                    <option value="Cardiology">{t('profile.departments.cardiology')}</option>
                                    <option value="Neurology">{t('profile.departments.neurology')}</option>
                                    <option value="General Medicine">{t('profile.departments.generalMedicine')}</option>
                                </select>
                            ) : (
                                <p className="text-gray-900">{getDepartmentDisplayName(profile.department)}</p>
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
                        {t('profile.facilityInfo.title')}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                {t('profile.facilityInfo.facility')}
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
                                {t('profile.facilityInfo.startDate')}
                            </label>
                            <p className="text-gray-900">
                                {new Date(profile.startDate).toLocaleDateString(i18n.language === 'pt' ? 'pt-PT' : 'en-US', {
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
                        {t('profile.accountSettings.title')}
                    </h3>
                    <div className="space-y-4">
                        {/* Language Preference */}
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">{t('profile.accountSettings.language')}</span>
                                </div>
                                {isEditing ? (
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        {SUPPORTED_LANGUAGES.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.flag} {lang.nativeName}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-lg">
                                            {SUPPORTED_LANGUAGES.find(l => l.code === (profile.language || 'en'))?.flag}
                                        </span>
                                        <span className="text-sm">
                                            {SUPPORTED_LANGUAGES.find(l => l.code === (profile.language || 'en'))?.nativeName}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span className="text-gray-700 font-medium">{t('profile.accountSettings.changePassword')}</span>
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
                                <span className="text-gray-700 font-medium">{t('profile.accountSettings.notifications')}</span>
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
                                <span className="text-gray-700 font-medium">{t('profile.accountSettings.privacy')}</span>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay - shown during load and save operations */}
            <LoadingOverlay isLoading={isLoading || isSaving} />
        </div>
    );
}

export default ProfileTab;
