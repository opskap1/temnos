import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion';
import {
  ArrowRight, Users, Shield,
  Smartphone, Menu, X, Store, LineChart,
  CheckCircle, Clock, Crown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// --- 1. THE NEW GRAPHIC SYSTEM (COLORS FLIPPED) ---
const FeatureGraphic = ({ type, className }: { type: string; className?: string }) => {
  
  const mainColor = "url(#triColorGradient)";
  const highlightColor = "#404040"; // Lighter Black

  const renderPath = () => {
    switch (type) {
      case 'loyalty': // Crown
        return (
          <g>
            <path d="M20 75 L80 75 L85 65 L15 65 Z" fill={mainColor} opacity="0.8"/>
            <path d="M15 65 L20 30 L35 55 L50 20 L65 55 L80 30 L85 65 Z" 
                  strokeWidth="4" stroke={mainColor} fill="none" strokeLinejoin="round"/>
            <circle cx="50" cy="20" r="4" fill={highlightColor}/>
            <circle cx="20" cy="30" r="3" fill={highlightColor}/>
            <circle cx="80" cy="30" r="3" fill={highlightColor}/>
          </g>
        );
      case 'qr': // QR Code
        return (
          <g>
            <rect x="15" y="15" width="25" height="25" rx="6" strokeWidth="4" stroke={mainColor} fill="none"/>
            <rect x="60" y="15" width="25" height="25" rx="6" strokeWidth="4" stroke={mainColor} fill="none"/>
            <rect x="15" y="60" width="25" height="25" rx="6" strokeWidth="4" stroke={mainColor} fill="none"/>
            <rect x="22" y="22" width="11" height="11" rx="3" fill={highlightColor}/>
            <rect x="67" y="22" width="11" height="11" rx="3" fill={highlightColor}/>
            <rect x="22" y="67" width="11" height="11" rx="3" fill={highlightColor}/>
            <circle cx="65" cy="65" r="4" fill={mainColor}/>
            <circle cx="80" cy="65" r="4" fill={mainColor}/>
            <circle cx="65" cy="80" r="4" fill={mainColor}/>
            <circle cx="50" cy="50" r="4" fill={highlightColor}/>
          </g>
        );
      case 'analytics': // Rising graph
        return (
          <g>
            <rect x="20" y="60" width="12" height="30" rx="2" fill={mainColor} opacity="0.6"/>
            <rect x="44" y="45" width="12" height="45" rx="2" fill={mainColor} opacity="0.6"/>
            <rect x="68" y="30" width="12" height="60" rx="2" fill={mainColor} opacity="0.6"/>
            <path d="M10 70 Q 30 70, 40 50 T 90 20" strokeWidth="5" stroke={mainColor} fill="none" strokeLinecap="round"/>
            <circle cx="90" cy="20" r="5" fill={highlightColor}/>
          </g>
        );
      case 'branch': // Network/Store
        return (
          <g>
            <circle cx="50" cy="60" r="15" strokeWidth="4" stroke={mainColor} fill="none"/>
            <circle cx="50" cy="60" r="6" fill={highlightColor}/>
            <line x1="50" y1="45" x2="50" y2="25" strokeWidth="3" stroke={mainColor}/>
            <line x1="38" y1="52" x2="20" y2="40" strokeWidth="3" stroke={mainColor}/>
            <line x1="62" y1="52" x2="80" y2="40" strokeWidth="3" stroke={mainColor}/>
            <circle cx="50" cy="15" r="8" strokeWidth="3" stroke={mainColor} fill="none"/>
            <circle cx="15" cy="35" r="8" strokeWidth="3" stroke={mainColor} fill="none"/>
            <circle cx="85" cy="35" r="8" strokeWidth="3" stroke={mainColor} fill="none"/>
          </g>
        );
      case 'security': // Shield/Lock
        return (
          <g>
            <path d="M50 15 C 20 15, 15 35, 15 55 C 15 80, 50 95, 50 95 C 50 95, 85 80, 85 55 C 85 35, 80 15, 50 15 Z" 
                  strokeWidth="4" stroke={mainColor} fill="none" strokeLinejoin="round"/>
            <circle cx="50" cy="50" r="12" strokeWidth="4" stroke={mainColor} fill="none"/>
            <path d="M50 50 L50 65" strokeWidth="4" stroke={highlightColor} strokeLinecap="round"/>
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient id="triColorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="20%" stopColor="#F7C9A4" />
          <stop offset="60%" stopColor="#E860B8" />
          <stop offset="100%" stopColor="#A478D8" />
        </linearGradient>
        <mask id={`mask-${type}`}>
           <rect x="-10" y="-10" width="120" height="120" fill="white" />
           <path d="M-10,110 L110,-10 L110,110 Z" fill="black" />
        </mask>
        <mask id={`mask-inverse-${type}`}>
           <rect x="-10" y="-10" width="120" height="120" fill="black" />
           <path d="M-10,110 L110,-10 L110,110 Z" fill="white" />
        </mask>
      </defs>
      <g mask={`url(#mask-${type})`} opacity="0.1">
        {renderPath()}
      </g>
      <g mask={`url(#mask-inverse-${type})`}>
        {renderPath()}
      </g>
    </svg>
  );
};

// --- 2. FOOTER LOGO COMPONENT ---
const FooterLogo = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="250 700 1500 700" preserveAspectRatio="xMidYMid meet" className="h-8 sm:h-9 w-auto">
    <defs>
      <linearGradient id="FooterGradient1" gradientUnits="userSpaceOnUse" x1="385.404" y1="976.949" x2="625.975" y2="952.048">
        <stop offset="0" stopColor="rgb(234,102,85)" />
        <stop offset="1" stopColor="rgb(189,90,165)" />
      </linearGradient>
      <linearGradient id="FooterGradient2" gradientUnits="userSpaceOnUse" x1="610.459" y1="832.721" x2="826.303" y2="819.445">
        <stop offset="0" stopColor="rgb(188,90,167)" />
        <stop offset="1" stopColor="rgb(128,81,254)" />
      </linearGradient>
      <linearGradient id="FooterGradient3" gradientUnits="userSpaceOnUse" x1="457.151" y1="1147.16" x2="749.541" y2="1069.83">
        <stop offset="0" stopColor="rgb(231,100,95)" />
        <stop offset="1" stopColor="rgb(151,83,226)" />
      </linearGradient>
      <filter id="FooterMultiGradient">
        <feMerge>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <g transform="translate(-150, 0) scale(1.1,1)">
      {/* Main Icon Shape - Uses Gradients */}
      <path fill="url(#FooterGradient1)" filter="url(#FooterMultiGradient)" d="M 448.064 1064.01 C 448.355 1064.2 448.644 1064.4 448.938 1064.59 C 491.567 1092.51 734.298 997.706 750.364 1064.59 C 753.776 1078.79 745.521 1093.5 737.967 1104.97 C 724.47 1125.47 674.133 1180.01 648.91 1184.91 C 643.623 1185.94 638.938 1185.11 634.541 1181.94 C 630.686 1179.16 628.307 1175.35 627.713 1170.62 C 625.604 1153.84 655.402 1122.78 639.778 1109.89 C 629.802 1101.66 609.924 1104.33 598.071 1105.95 C 563.443 1110.7 514.941 1122.64 480.452 1118.06 C 469.097 1112.92 440.506 1120.36 447.167 1097.47 C 449.864 1088.2 444.698 1069.66 446.402 1064.37 L 448.064 1064.01 M 608.9 805.465 C 654.88 779.725 744.556 738.358 797.091 749.236 C 858.04 761.856 810.325 876.049 779.055 897.999 C 764.609 908.139 748.298 890.903 744.535 876.43 C 749.113 857.841 754.24 844.406 757.737 824.991 C 727.452 830.953 692.769 848.186 663.174 858.242 C 653.337 861.584 640.994 869.014 631.466 871.815 L 620.692 876.649 C 617.683 874.03 618.86 875.652 617.497 872.011 L 616.013 868.05 C 612.844 859.559 607.279 827.044 604.714 815.738 C 602.097 813.361 601.941 813.009 600.896 809.847 C 601.941 813.009 602.097 813.361 604.714 815.738 C 607.279 827.044 612.844 859.559 616.013 868.05 L 617.497 872.011 C 618.86 875.652 617.683 874.03 620.692 876.649 C 557.119 905.454 477.081 952.912 449.812 1020.7 C 444.351 1034.28 441.123 1050.41 448.064 1064.01 L 446.402 1064.37 C 444.698 1069.66 449.864 1088.2 447.167 1097.47 C 440.506 1120.36 469.097 1112.92 480.452 1118.06 C 373.899 1118.81 374.34 1035.36 420.099 961.666 C 462.53 893.33 531.037 847.011 600.896 809.847 z"/>
      
      {/* Logotype Text - Converted from dark rgb(48,58,83) to WHITE for footer visibility */}
      <path fill="white" fillRule="evenodd" d="M 916.022 873.409 C 944.07 870.919 972.347 876.046 995.579 892.859 C 1030.03 917.791 1036.67 970.222 1010.3 1003.51 C 980.562 1041.04 923.049 1049.68 877.927 1055.14 C 880.334 1060.62 882.482 1065.01 885.448 1070.32 C 909.619 1113.6 969.478 1114.67 998.759 1076.39 C 1003.06 1070.76 1005.29 1065.5 1008.25 1058.87 C 1013.13 1065 1014.84 1068.52 1017.15 1075.8 C 1020.67 1091.4 1015.84 1107.56 1005.73 1119.69 C 969.955 1162.83 893.492 1162.04 851.787 1128.38 C 791.861 1080.02 787.76 971.618 835.739 913.675 C 856.796 888.245 883.555 876.355 916.022 873.409 M 922.962 906.233 C 961.264 904.33 967.365 945.696 958.425 974.235 C 950.172 1000.58 923.873 1016.06 900.297 1027.38 C 891.572 1031.3 882.542 1034.5 873.297 1036.96 C 867.69 997.387 872.2 915.696 922.962 906.233 z"/>
      <path fill="white" d="M 1231.53 877.227 C 1242.69 877.123 1280.99 875.989 1289.81 878.335 C 1294.7 879.639 1298.78 882.993 1301.01 887.534 C 1302.91 891.334 1303.44 896.658 1302.26 900.622 C 1297.31 917.377 1290.46 935.167 1284.58 951.61 L 1245.78 1060.27 C 1227.37 1107.19 1211.92 1157.25 1194.51 1204.69 C 1184.39 1232.3 1192.16 1261.29 1211.28 1283.22 C 1192.45 1283.51 1174.06 1283.87 1155.22 1283.25 C 1123.95 1282.21 1121.71 1257.31 1131.3 1233.01 C 1142.5 1204.61 1154.41 1176.12 1166.71 1148.1 C 1125.44 1137.39 1120.9 1110.68 1107.53 1074.63 C 1083.07 1008.7 1057.2 943.159 1033.22 877.069 C 1059.93 878.36 1106.71 868.629 1118.93 899.526 C 1144.26 963.568 1164.52 1030.32 1189.51 1094.54 C 1192.1 1082.77 1199.1 1063.24 1203.02 1051.25 L 1227.97 975.059 C 1238.23 943.665 1253.77 906.742 1231.53 877.227 z"/>
      <path fill="white" d="M 1526.23 873.379 C 1552.44 870.866 1588.46 876.063 1609.06 892.542 C 1668.75 940.281 1621.4 959.844 1574.04 966.222 C 1574.12 948.279 1572.43 928.909 1559.06 915.302 C 1551.46 907.677 1541.08 903.493 1530.32 903.722 C 1514.4 903.905 1493.07 917.002 1496.59 933.895 C 1503.78 968.376 1557.17 981.868 1584.41 997.059 C 1596.04 1003.54 1606.36 1007.88 1616.61 1016.39 C 1649.52 1040.72 1655.91 1083.81 1628.81 1115.51 C 1607.17 1140.83 1579.9 1149.49 1547.24 1152.76 C 1522.69 1154.22 1492.9 1147.02 1471.68 1134.52 C 1419.2 1103.58 1437.13 1060.86 1490.01 1048.17 C 1490.05 1049.63 1490.13 1051.08 1490.26 1052.53 C 1493.03 1087.01 1516.11 1122.35 1555.3 1119.31 C 1582.3 1117.21 1593.1 1092 1570.18 1075.03 C 1563.25 1069.9 1556.36 1065 1548.63 1060.96 C 1526.08 1048.87 1503.88 1037.41 1481.59 1024.81 C 1436.83 999.511 1424.77 951.058 1457.41 909.998 C 1474.09 889.012 1499.31 876.37 1526.23 873.379 z"/>
      <path fill="white" d="M 1320.23 741.946 C 1336.96 742.21 1365.3 739.544 1379.5 746.151 C 1389.57 750.819 1397.01 759.774 1399.75 770.534 C 1402.44 780.865 1401.25 828.135 1401.24 841.623 L 1401.23 984.582 C 1401.23 1026.78 1398.1 1111.63 1410.65 1148.24 C 1391.98 1148.46 1362.04 1151.56 1345.84 1141.7 C 1326.11 1129.68 1328.71 1107.5 1328.74 1087.23 L 1328.83 1038.69 L 1328.86 890.992 C 1328.86 838.911 1331.26 793.178 1320.23 741.946 z"/>
    </g>

    <g transform="translate(-75, 22)">
      <path fill="white" d="M 559.979 1188.3 C 572.005 1187.1 585.592 1187.7 596.602 1193.11 C 604.638 1196.99 610.738 1203.99 613.49 1212.49 C 622.265 1239.06 605.03 1265.05 579.42 1273.31 C 548.231 1280.07 520.898 1260.17 525.065 1227.49 C 527.974 1204.66 537.172 1191.88 559.979 1188.3 z"/>
    </g>
  </svg>
);

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0.98, 1]);

  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '1 month',
      description: 'Perfect for testing our platform',
      features: [
        'Up to 100 customers',
        'Basic loyalty program',
        'QR code system',
        'Basic analytics',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false,
      planId: 'trial'
    },
    {
      name: 'Monthly',
      price: '$2.99',
      period: 'per month',
      description: 'Flexible monthly billing',
      features: [
        'Unlimited customers',
        'Advanced loyalty features',
        'Multi-branch support',
        'Advanced analytics',
        'Priority support',
        'Custom rewards',
        'Staff management'
      ],
      cta: 'Get Started',
      popular: true,
      planId: 'monthly'
    },
    {
      name: '6 Months',
      price: '$9.99',
      period: 'one-time',
      description: 'Save 44% with 6-month plan',
      features: [
        'Everything in Monthly',
        'Advanced ROI analytics',
        'Custom branding',
        'API access',
        'Dedicated support',
        'Training sessions'
      ],
      cta: 'Choose 6 Months',
      popular: false,
      planId: 'semiannual'
    },
    {
      name: '1 Year',
      price: '$19.99',
      period: 'one-time',
      description: 'Best value - Save 67%',
      features: [
        'Everything in 6 Months',
        'White-label solution',
        'Custom integrations',
        'Account manager',
        'Advanced reporting',
        'Priority feature requests'
      ],
      cta: 'Choose Annual',
      popular: false,
      planId: 'annual'
    }
  ];

  // --- FEATURES CONFIGURATION ---
  const features = [
    {
      icon: Crown, 
      title: 'Customer Loyalty Program',
      description: 'Automated point system with tier-based rewards that keep customers coming back.',
      color: 'from-[#E6A85C] to-[#E85A9B]',
      graphicType: 'loyalty',
      graphicProps: 'rotate-[-10deg] scale-110 -bottom-10 -right-10' 
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee and data protection.',
      color: 'from-[#6366f1] to-[#4f46e5]',
      graphicType: 'security',
      graphicProps: 'rotate-[15deg] scale-100 -bottom-8 -right-12' 
    },
    {
      icon: LineChart,
      title: 'Advanced Analytics',
      description: 'Real-time insights into customer behavior, ROI, and loyalty program performance.',
      color: 'from-[#3b82f6] to-[#2563eb]',
      graphicType: 'analytics',
      graphicProps: 'rotate-[0deg] scale-125 -bottom-14 -right-8' 
    },
    {
      icon: Store,
      title: 'Multi-Branch Support',
      description: 'Manage multiple locations with unified customer data and branch-specific insights.',
      color: 'from-[#f59e0b] to-[#d97706]',
      graphicType: 'branch',
      graphicProps: 'rotate-[-5deg] scale-110 -bottom-12 -right-16' 
    },
    {
      icon: Smartphone,
      title: 'QR Code Integration',
      description: 'Seamless point earning through QR codes - no apps required for customers.',
      color: 'from-[#10b981] to-[#059669]',
      graphicType: 'qr',
      graphicProps: 'rotate-[12deg] scale-105 -bottom-16 -right-12' 
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100"
        style={{ opacity: headerOpacity }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center">
              <img
                src="/leyls-svg.svg"
                alt="Leyls"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
              />
            </button>

            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('trusted-by')}
                className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Customers
              </button>
              <Link
                to="/login"
                className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Sign In
              </Link>
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white px-5 lg:px-6 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                Start Free Trial
              </button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-100 shadow-lg"
            >
              <div className="px-4 py-5 space-y-1">
                <button
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all font-medium"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection('trusted-by')}
                  className="block w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all font-medium"
                >
                  Customers
                </button>
                <Link
                  to="/login"
                  className="block w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all font-medium"
                >
                  Sign In
                </Link>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="w-full bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white px-4 py-3.5 rounded-xl text-base font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <section className="pt-28 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-[1.15] tracking-tight">
                <span className="bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] bg-clip-text text-transparent">
                  Restaurant Loyalty,
                </span>
                <br />
                <span className="text-gray-900">Simplified</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 sm:mb-12 leading-relaxed max-w-3xl mx-auto font-light"
            >
              Build stronger customer relationships with an elegant loyalty platform designed for modern restaurants
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16"
            >
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white px-8 py-4 rounded-xl text-base sm:text-lg font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12 text-sm sm:text-base text-gray-500"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">500+ Restaurants</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
              Everything you need
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              A complete loyalty platform with the essentials
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="
              grid 
              grid-cols-1 
              lg:grid-cols-6 
              gap-6 sm:gap-8 lg:gap-10
            "
          >
            {features.slice(0, 3).map((feature) => {
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="
                    bg-white 
                    rounded-3xl 
                    border border-gray-100 
                    hover:border-gray-200 
                    hover:shadow-xl 
                    transition-all duration-300 
                    group
                    lg:col-span-2
                    relative overflow-hidden
                    flex flex-col justify-between
                    h-72
                  "
                >
                  <div className="p-8 relative z-10">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-sm`}>
                      <feature.icon className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-full h-full pointer-events-none">
                      <FeatureGraphic 
                        type={feature.graphicType}
                        className={`absolute w-48 h-48 sm:w-56 sm:h-56 transition-transform duration-500 ${feature.graphicProps}`}
                      />
                  </div>
                </motion.div>
              );
            })}

            {features.slice(3, 5).map((feature) => {
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className={`
                    bg-white 
                    rounded-3xl 
                    border border-gray-100 
                    hover:border-gray-200 
                    hover:shadow-xl 
                    transition-all duration-300 
                    group
                    lg:col-span-3
                    relative overflow-hidden
                    flex flex-col justify-center
                    h-72
                  `}
                >
                    <div className="p-8 sm:pr-32 relative z-10">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-sm`}>
                        <feature.icon className="h-6 w-6 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-base text-gray-600 leading-relaxed font-light max-w-[60%] sm:max-w-md">
                        {feature.description}
                      </p>
                    </div>
                    <div className="absolute right-0 bottom-0 w-full h-full pointer-events-none">
                      <FeatureGraphic 
                        type={feature.graphicType}
                        className={`absolute w-64 h-64 sm:w-80 sm:h-80 transition-transform duration-500 ${feature.graphicProps}`}
                      />
                    </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
              Simple pricing
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Choose the plan that works for you
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                className={`relative bg-white rounded-2xl p-6 sm:p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? 'border-[#E6A85C] shadow-lg scale-[1.01] lg:scale-[1.03]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8 pt-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm sm:text-base text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-3.5 sm:space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/signup', { state: { selectedPlan: plan.planId } })}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white hover:shadow-lg hover:scale-[1.02]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- TRUSTED BY SECTION (Replaces Reviews) --- */}
      <section id="trusted-by" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
          >
            <h3 className="text-xl sm:text-2xl text-gray-500 font-medium mb-12">
              Trusted by growing restaurants
            </h3>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Dummy "Logo" text graphics */}
               <span className="text-3xl font-black text-gray-400 tracking-tighter">BURGER LAB</span>
               <span className="text-3xl font-black text-gray-400 tracking-widest font-serif">SAFFRON</span>
               <span className="text-2xl font-bold text-gray-400 uppercase">Urban<span className="text-gray-300">Eats</span></span>
               <span className="text-3xl font-extrabold text-gray-400 italic">CRISP.</span>
               <span className="text-2xl font-bold text-gray-400 border-2 border-gray-300 p-2 rounded-lg">LOCAL JOINT</span>
            </div>
          </motion.div>
        </div>
      </section>
            <section className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 tracking-tight leading-tight">
              Ready to get started?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/95 mb-10 sm:mb-12 leading-relaxed font-light max-w-2xl mx-auto">
              Join restaurants using Leyls to build customer loyalty
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl text-base sm:text-lg font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/login"
                className="border-2 border-white/40 text-white px-8 py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-white/15 hover:border-white/60 transition-all duration-300 flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- RESTORED FOOTER --- */}
      <footer className="py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
            <div className="flex items-center">
              {/* Logo without white box background */}
              <FooterLogo />
            </div>
            <div className="flex items-center gap-6 sm:gap-8 text-sm sm:text-base text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors font-medium">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors font-medium">
                Terms
              </Link>
              <Link to="/support" className="hover:text-white transition-colors font-medium">
                Support
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-8 sm:pt-10 text-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2025 Leyls. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;