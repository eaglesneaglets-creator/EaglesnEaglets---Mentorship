import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const TabBar = ({ tabs, activeTab, onChange, variant = 'underline', className = '' }) => {
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabRefs = useRef({});
    const containerRef = useRef(null);

    useEffect(() => {
        const activeEl = tabRefs.current[activeTab];
        if (activeEl && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const tabRect = activeEl.getBoundingClientRect();

            if (variant === 'underline') {
                setIndicatorStyle({
                    left: tabRect.left - containerRect.left,
                    width: tabRect.width,
                });
            } else {
                setIndicatorStyle({
                    left: tabRect.left - containerRect.left,
                    width: tabRect.width,
                    height: tabRect.height,
                });
            }
        }
    }, [activeTab, variant]);

    if (variant === 'pill') {
        return (
            <div
                ref={containerRef}
                className={`relative inline-flex items-center bg-slate-100 rounded-xl p-1 ${className}`}
            >
                {/* Animated pill background */}
                <div
                    className="absolute top-1 rounded-lg bg-white shadow-sm border border-slate-200/50 transition-all duration-300 ease-out"
                    style={{
                        left: indicatorStyle.left,
                        width: indicatorStyle.width,
                        height: indicatorStyle.height,
                    }}
                />
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        ref={(el) => { tabRefs.current[tab.value] = el; }}
                        onClick={() => onChange(tab.value)}
                        className={`
                            relative z-10 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300
                            ${activeTab === tab.value
                                ? 'text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                            }
                        `.trim().replace(/\s+/g, ' ')}
                    >
                        <span className="flex items-center gap-1.5">
                            {tab.icon && (
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            )}
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`
                                    px-1.5 py-0.5 text-[10px] font-bold rounded-full
                                    ${activeTab === tab.value ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}
                                `}>
                                    {tab.count}
                                </span>
                            )}
                        </span>
                    </button>
                ))}
            </div>
        );
    }

    // Default: underline variant
    return (
        <div
            ref={containerRef}
            className={`relative flex border-b border-slate-200 ${className}`}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    ref={(el) => { tabRefs.current[tab.value] = el; }}
                    onClick={() => onChange(tab.value)}
                    className={`
                        px-5 py-3 text-sm font-medium transition-colors duration-300 relative
                        ${activeTab === tab.value
                            ? 'text-primary'
                            : 'text-slate-500 hover:text-slate-700'
                        }
                    `.trim().replace(/\s+/g, ' ')}
                >
                    <span className="flex items-center gap-1.5">
                        {tab.icon && (
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        )}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`
                                ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full
                                ${activeTab === tab.value ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}
                            `}>
                                {tab.count}
                            </span>
                        )}
                    </span>
                </button>
            ))}

            {/* Animated underline */}
            <div
                className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
                style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                }}
            />
        </div>
    );
};

TabBar.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.string,
            count: PropTypes.number,
        })
    ).isRequired,
    activeTab: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['underline', 'pill']),
    className: PropTypes.string,
};

export default TabBar;
