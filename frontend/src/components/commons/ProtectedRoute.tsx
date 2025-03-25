import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
	children: JSX.Element;
	redirectPath: string;
	tokenName: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	redirectPath,
	tokenName,
}) => {
	const navigate = useNavigate();
	const [isValidating, setIsValidating] = useState(true);
	const token = localStorage.getItem(tokenName);

	useEffect(() => {
		const checkTokenValidity = async () => {
			try {
				if (!token || token === 'undefined') {
					navigate(redirectPath, { replace: true });
					return;
				}

				// Decode JWT token
				const tokenData = JSON.parse(atob(token.split('.')[1]));
				if (tokenData.exp * 1000 < Date.now()) {
					// Token expired
					localStorage.removeItem(tokenName);
					navigate(redirectPath, { replace: true });
				}
			} catch (error) {
				console.error('Token validation error:', error);
				localStorage.removeItem(tokenName);
				navigate(redirectPath, { replace: true });
			} finally {
				setIsValidating(false);
			}
		};

		checkTokenValidity();
		const interval = setInterval(checkTokenValidity, 60000); // Check every minute

		return () => {
			clearInterval(interval);
		};
	}, [navigate, redirectPath, tokenName, token]);

	if (isValidating) {
		return null; // or a loading spinner
	}

	if (!token || token === 'undefined') {
		return <Navigate to={redirectPath} replace />;
	}

	return children;
};

export default ProtectedRoute;
