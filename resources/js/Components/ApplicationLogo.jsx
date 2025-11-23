export default function ApplicationLogo(props) {
    return (
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
            <svg
                {...props}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
            >
                <path
                    d="M12 14l9-5-9-5-9 5 9 5z"
                    fill="currentColor"
                />
                <path
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    fill="currentColor"
                />
            </svg>
        </div>
    );
}
