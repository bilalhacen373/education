const educationAgeMap = {
    'السنة الأولى ابتدائي': 6,
    'السنة الثانية ابتدائي': 7,
    'السنة الثالثة ابتدائي': 8,
    'السنة الرابعة ابتدائي': 9,
    'السنة الخامسة ابتدائي': 10,
    'السنة الأولى متوسط': 11,
    'السنة الثانية متوسط': 12,
    'السنة الثالثة متوسط': 13,
    'السنة الرابعة متوسط': 14,
    'السنة الأولى ثانوي': 15,
    'السنة الثانية ثانوي': 16,
    'السنة الثالثة ثانوي': 17,
    'السنة الرابعة ثانوي': 18,

    'first year primary': 6,
    'second year primary': 7,
    'third year primary': 8,
    'fourth year primary': 9,
    'fifth year primary': 10,
    'first year middle school': 11,
    'second year middle school': 12,
    'third year middle school': 13,
    'fourth year middle school': 14,
    'first year high school': 15,
    'second year high school': 16,
    'third year high school': 17,
    'fourth year high school': 18,
};

const calculateBirthYearFromAge = (expectedAge) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let birthYear = currentYear - expectedAge;

    if (currentMonth < 9) {
        birthYear -= 1;
    }

    return birthYear;
};

export const getExpectedBirthDateFromEducationLevel = (subcategoryName) => {
    if (!subcategoryName) return null;

    const nameToSearch = subcategoryName.toLowerCase().trim();

    let expectedAge = educationAgeMap[nameToSearch];

    if (!expectedAge) {
        for (const [key, age] of Object.entries(educationAgeMap)) {
            if (nameToSearch.includes(key.toLowerCase()) || key.toLowerCase().includes(nameToSearch)) {
                expectedAge = age;
                break;
            }
        }
    }

    if (!expectedAge) {
        const yearMatch = subcategoryName.match(/(\d+)/);
        if (yearMatch) {
            const yearNumber = parseInt(yearMatch[1]);

            if (subcategoryName.includes('ابتدائي') || subcategoryName.includes('primary')) {
                expectedAge = 5 + yearNumber;
            } else if (subcategoryName.includes('متوسط') || subcategoryName.includes('middle')) {
                expectedAge = 10 + yearNumber;
            } else if (subcategoryName.includes('ثانوي') || subcategoryName.includes('secondary') || subcategoryName.includes('high')) {
                expectedAge = 14 + yearNumber;
            }
        }
    }

    if (!expectedAge) return null;

    const birthYear = calculateBirthYearFromAge(expectedAge);
    const currentMonth = new Date().getMonth() + 1;

    let birthMonth = 9;
    let birthDay = 1;

    if (currentMonth >= 9) {
        birthMonth = 9;
    } else {
        birthMonth = 9;
    }

    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

    return birthDate;
};

export const getAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};
