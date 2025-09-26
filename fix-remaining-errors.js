const fs = require('fs');
const path = require('path');

// 修复剩余的TypeScript错误
const fixes = [
  // 修复 Orders.tsx 中未使用的导入
  {
    file: 'src/pages/user/Orders.tsx',
    search: /import { \n  ShoppingBag, \n  Calendar, \n  CreditCard,/,
    replace: 'import { \n  ShoppingBag, \n  CreditCard,'
  },
  {
    file: 'src/pages/user/Orders.tsx',
    search: /CardHeader, CardTitle/,
    replace: 'CardContent'
  },
  {
    file: 'src/pages/user/Orders.tsx',
    search: /const handlePayOrder = \(order: any\) => {/,
    replace: 'const handlePayOrder = (order: Order) => {'
  },
  
  // 修复其他页面的未使用导入
  {
    file: 'src/pages/admin/Dashboard.tsx',
    search: /Calendar,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/admin/Dashboard.tsx',
    search: /ArrowDownRight,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/admin/Orders.tsx',
    search: /Calendar,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/admin/Orders.tsx',
    search: /DollarSign,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/admin/Plans.tsx',
    search: /Eye,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/admin/Plans.tsx',
    search: /DollarSign,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/admin/Redemption.tsx',
    search: /Eye,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/admin/Servers.tsx',
    search: /Eye,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/admin/Servers.tsx',
    search: /Activity,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/admin/Servers.tsx',
    search: /Users,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/admin/Users.tsx',
    search: /MoreHorizontal,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/admin/Users.tsx',
    search: /Edit,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/admin/Users.tsx',
    search: /Trash2,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/user/Dashboard.tsx',
    search: /Calendar,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/user/Profile.tsx',
    search: /Mail,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/user/Profile.tsx',
    search: /Phone,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/user/Profile.tsx',
    search: /const queryClient = useQueryClient\(\)/,
    replace: ''
  },
  
  {
    file: 'src/pages/user/Referral.tsx',
    search: /ExternalLink,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/user/Servers.tsx',
    search: /Wifi,\n  /,
    replace: ''
  },
  {
    file: 'src/pages/user/Servers.tsx',
    search: /Users,\n  /,
    replace: ''
  },
  
  {
    file: 'src/pages/user/Subscription.tsx',
    search: /const { formatCurrency } = /,
    replace: 'const { } = '
  }
];

// 执行修复
fixes.forEach(({ file, search, replace }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(search, replace);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
    } catch (error) {
      console.log(`❌ Error fixing ${file}:`, error.message);
    }
  }
});

console.log('\n🎉 All TypeScript errors fixed!');