const fs = require('fs');
const path = require('path');

// 修复所有TypeScript错误的配置
const fileFixConfigs = [
  // Admin Dashboard
  {
    file: 'src/pages/admin/Dashboard.tsx',
    fixes: [
      { search: /,\s*Calendar,/, replace: ',' },
      { search: /,\s*ArrowDownRight/, replace: '' }
    ]
  },
  
  // Admin Orders
  {
    file: 'src/pages/admin/Orders.tsx',
    fixes: [
      { search: /,\s*Calendar,/, replace: ',' },
      { search: /,\s*DollarSign/, replace: '' }
    ]
  },
  
  // Admin Plans
  {
    file: 'src/pages/admin/Plans.tsx',
    fixes: [
      { search: /,\s*Eye,/, replace: ',' },
      { search: /,\s*DollarSign,/, replace: ',' }
    ]
  },
  
  // Admin Redemption
  {
    file: 'src/pages/admin/Redemption.tsx',
    fixes: [
      { search: /,\s*Eye,/, replace: ',' }
    ]
  },
  
  // Admin Servers
  {
    file: 'src/pages/admin/Servers.tsx',
    fixes: [
      { search: /,\s*Eye,/, replace: ',' },
      { search: /,\s*Activity,/, replace: ',' },
      { search: /,\s*Users/, replace: '' }
    ]
  },
  
  // Admin Users
  {
    file: 'src/pages/admin/Users.tsx',
    fixes: [
      { search: /,\s*MoreHorizontal,/, replace: ',' },
      { search: /,\s*Edit,/, replace: ',' },
      { search: /,\s*Trash2/, replace: '' }
    ]
  },
  
  // Login Page
  {
    file: 'src/pages/LoginPage.tsx',
    fixes: [
      { search: /import { toast } from 'react-hot-toast'\n/, replace: '' }
    ]
  },
  
  // Plans Page
  {
    file: 'src/pages/PlansPage.tsx',
    fixes: [
      { search: /const \[selectedPlan, setSelectedPlan\] = useState<Plan \| null>\(null\)\n/, replace: '' }
    ]
  },
  
  // Redeem Page
  {
    file: 'src/pages/RedeemPage.tsx',
    fixes: [
      { search: /import { Badge } from '@\/components\/ui\/Badge'\n/, replace: '' }
    ]
  },
  
  // Register Page
  {
    file: 'src/pages/RegisterPage.tsx',
    fixes: [
      { search: /import { toast } from 'react-hot-toast'\n/, replace: '' }
    ]
  },
  
  // User Dashboard
  {
    file: 'src/pages/user/Dashboard.tsx',
    fixes: [
      { search: /,\s*Calendar,/, replace: ',' }
    ]
  },
  
  // User Orders
  {
    file: 'src/pages/user/Orders.tsx',
    fixes: [
      { search: /,\s*Calendar,/, replace: ',' }
    ]
  },
  
  // User Profile
  {
    file: 'src/pages/user/Profile.tsx',
    fixes: [
      { search: /, useQueryClient/, replace: '' },
      { search: /,\s*Mail,/, replace: ',' },
      { search: /,\s*Phone,/, replace: ',' }
    ]
  },
  
  // User Referral
  {
    file: 'src/pages/user/Referral.tsx',
    fixes: [
      { search: /,\s*ExternalLink/, replace: '' }
    ]
  },
  
  // User Servers
  {
    file: 'src/pages/user/Servers.tsx',
    fixes: [
      { search: /,\s*Wifi,/, replace: ',' },
      { search: /,\s*Users,/, replace: ',' }
    ]
  },
  
  // User Subscription
  {
    file: 'src/pages/user/Subscription.tsx',
    fixes: [
      { search: /formatCurrency, /, replace: '' }
    ]
  }
];

// 执行修复
let totalFixed = 0;
fileFixConfigs.forEach(({ file, fixes }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let fileFixed = false;
      
      fixes.forEach(({ search, replace }) => {
        if (content.match(search)) {
          content = content.replace(search, replace);
          fileFixed = true;
        }
      });
      
      if (fileFixed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
      }
    } catch (error) {
      console.log(`❌ Error fixing ${file}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} files! All TypeScript errors should be resolved.`);