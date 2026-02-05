/**
 * Composant ProgressBar reutilisable
 */

export default function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  color = 'blue',
  showLabel = false,
  label,
  animated = false,
  className = '',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const colors = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    purple: 'bg-purple-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
    slate: 'bg-slate-600',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
  };

  // Couleur dynamique selon le pourcentage
  const getAutoColor = () => {
    if (percentage >= 80) return 'bg-emerald-600';
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage >= 25) return 'bg-amber-600';
    return 'bg-red-600';
  };

  const barColor = color === 'auto' ? getAutoColor() : colors[color];

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700">
            {label || 'Progression'}
          </span>
          <span className="text-sm font-medium text-slate-600">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`
            ${sizes[size]} ${barColor} rounded-full transition-all duration-500 ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Barre de progression circulaire
export function CircularProgress({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'blue',
  showValue = true,
  className = '',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-slate-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`${colors[color]} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showValue && (
        <span className="absolute text-sm font-semibold text-slate-700">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// Barre de progression avec steps
export function StepProgress({
  currentStep = 1,
  totalSteps = 4,
  labels = [],
  className = '',
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-300
                ${step < currentStep
                  ? 'bg-blue-600 text-white'
                  : step === currentStep
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-600'
                }
              `}
            >
              {step < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )}
            </div>
            
            {/* Connector line */}
            {step < totalSteps && (
              <div
                className={`
                  w-16 sm:w-24 h-1 mx-2
                  ${step < currentStep ? 'bg-blue-600' : 'bg-slate-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((label, i) => (
            <span 
              key={i}
              className={`
                text-xs font-medium
                ${i + 1 <= currentStep ? 'text-blue-600' : 'text-slate-500'}
              `}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
