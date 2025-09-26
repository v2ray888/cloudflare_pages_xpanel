const fs = require('fs');
const path = require('path');

// 修复文件的函数
function fixFile(filePath, fixes) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    fixes.forEach(fix => {
      content = content.replace(fix.search, fix.replace);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// 修复配置
const fixes = [
  // src/components/layout/Header.tsx - 移除未使用的cn导入
  {
    file: 'src/components/layout/Header.tsx',
    fixes: [
      {
        search: /import.*cn.*from.*$/m,
        replace: ''
      }
    ]
  },
  
  // src/hooks/useLocalStorage.ts - 移除未使用的useEffect导入
  {
    file: 'src/hooks/useLocalStorage.ts',
    fixes: [
      {
        search: /import { useState, useEffect } from 'react'/,
        replace: "import { useState } from 'react'"
      }
    ]
  },
  
  // src/main.tsx - 移除react-query-devtools导入
  {
    file: 'src/main.tsx',
    fixes: [
      {
        search: /import { ReactQueryDevtools } from '@tanstack\/react-query-devtools'/,
        replace: ''
      },
      {
        search: /<ReactQueryDevtools initialIsOpen={false} \/>/,
        replace: ''
      }
    ]
  },
  
  // src/pages/HomePage.tsx - 移除未使用的Check导入
  {
    file: 'src/pages/HomePage.tsx',
    fixes: [
      {
        search: /, Check/,
        replace: ''
      }
    ]
  },
  
  // src/pages/LoginPage.tsx - 移除未使用的toast导入
  {
    file: 'src/pages/LoginPage.tsx',
    fixes: [
      {
        search: /import toast from 'react-hot-toast'/,
        replace: ''
      }
    ]
  },
  
  // src/pages/PaymentPage.tsx - 修复类型错误
  {
    file: 'src/pages/PaymentPage.tsx',
    fixes: [
      {
        search: /import { useState, useEffect } from 'react'/,
        replace: "import { useState } from 'react'"
      },
      {
        search: /parseInt\(planId\)/,
        replace: 'planId'
      }
    ]
  },
  
  // src/pages/PlansPage.tsx - 移除未使用的导入
  {
    file: 'src/pages/PlansPage.tsx',
    fixes: [
      {
        search: /import { useState, useEffect } from 'react'/,
        replace: "import { useState } from 'react'"
      },
      {
        search: /const \[selectedPlan, setSelectedPlan\] = useState<number \| null>\(null\);/,
        replace: ''
      }
    ]
  },
  
  // src/pages/RedeemPage.tsx - 移除未使用的Badge导入
  {
    file: 'src/pages/RedeemPage.tsx',
    fixes: [
      {
        search: /import { Badge } from '..\/components\/ui\/Badge'/,
        replace: ''
      }
    ]
  },
  
  // src/pages/RegisterPage.tsx - 移除未使用的toast导入
  {
    file: 'src/pages/RegisterPage.tsx',
    fixes: [
      {
        search: /import toast from 'react-hot-toast'/,
        replace: ''
      }
    ]
  }
];

// 执行修复
fixes.forEach(({ file, fixes: fileFixes }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fixFile(filePath, fileFixes);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n🎉 TypeScript errors fixed!');