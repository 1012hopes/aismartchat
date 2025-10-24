# AI Chat 设计系统文档

> 灵感来源：Apple、OpenAI  
> 设计理念：纯净、现代、优雅、专业

---

## 🎨 设计原则

### 1. **极简主义**
- 去除不必要的装饰元素
- 专注于内容和功能
- 留白营造呼吸感

### 2. **一致性**
- 统一的圆角、间距、阴影系统
- 统一的交互反馈
- 统一的动画曲线

### 3. **可访问性**
- 高对比度文字
- 清晰的视觉层级
- 明确的交互状态

---

## 🌈 色彩系统

### 浅色主题 (Light Mode)
```scss
背景系统：
- 主背景：#ffffff (纯白)
- 次级背景：#f5f5f7 (浅灰)
- 三级背景：#e8e8ed (中浅灰)

文字系统：
- 主文字：#1d1d1f (近黑)
- 次级文字：#86868b (中灰)
- 三级文字：#b0b0b5 (浅灰)

主题色：
- 科技蓝：#0066ff
- 悬停蓝：#0055d4
- 浅色背景：rgba(0, 102, 255, 0.1)
```

### 深色主题 (Dark Mode)
```scss
背景系统：
- 主背景：#1d1d1f (深灰)
- 次级背景：#2c2c2e (中深灰)
- 三级背景：#3a3a3c (中灰)

文字系统：
- 主文字：#f5f5f7 (近白)
- 次级文字：#98989d (中浅灰)
- 三级文字：#636366 (中灰)

主题色：
- 科技蓝：#0a84ff (亮蓝)
- 悬停蓝：#409cff (更亮)
- 浅色背景：rgba(10, 132, 255, 0.15)
```

### 状态色
```scss
成功：#34c759 (绿色)
错误：#ff3b30 (红色)
警告：#ff9500 (橙色)
```

---

## 📐 空间系统

### 圆角 (Border Radius)
```scss
小：4px   // 消息气泡的内角
中：8px   // 按钮、卡片
大：10-12px // 输入框
超大：16-18px // 消息气泡外角
圆形：50% // 头像
```

### 间距 (Spacing)
```scss
极小：4px
小：8px
中：12px
正常：16px
大：20px
超大：24px
特大：32px
```

### 阴影系统 (Shadows)
```scss
// 浅色模式
--shadow-sm: 轻微阴影，用于悬浮元素
--shadow-md: 中等阴影，用于卡片
--shadow-lg: 大阴影，用于弹窗和侧边栏

// 深色模式
使用更深的阴影以增强层次感
```

---

## 🎯 组件设计

### 1. 消息气泡

#### 用户消息
- **背景**：科技蓝渐变
- **文字**：白色
- **圆角**：18px 18px 4px 18px (右上有小缺口)
- **对齐**：右对齐
- **最大宽度**：85%
- **内边距**：14px 18px
- **阴影**：轻微阴影

#### AI消息
- **背景**：浅灰/深灰卡片
- **文字**：主文字色
- **圆角**：4px 18px 18px 18px (左上有小缺口)
- **对齐**：左对齐，带头像
- **头像**：32px圆形，蓝色渐变
- **内边距**：16px 20px
- **阴影**：悬停时增强

### 2. 输入框
- **背景**：双层设计（外层容器+内层输入）
- **边框**：1.5px，聚焦时变蓝
- **圆角**：16px
- **聚焦效果**：蓝色光环 (3px)
- **过渡**：200ms 缓动

### 3. 按钮

#### 发送按钮
- **默认**：灰色，禁用状态
- **激活**：科技蓝，带阴影
- **悬停**：上移1px，阴影增强
- **点击**：缩小至96%

#### 停止按钮
- **背景**：红色
- **动画**：脉冲效果
- **悬停**：放大至105%

### 4. 头像

#### AI头像
```scss
尺寸：32px × 32px
形状：圆形 (border-radius: 50%)
背景：linear-gradient(135deg, #0066ff 0%, #0099ff 100%)
阴影：轻微阴影
```

---

## ✨ 动画系统

### 动画曲线
```scss
标准缓动：cubic-bezier(0.4, 0, 0.2, 1)
用于：大多数过渡效果

线性：linear
用于：旋转、持续动画
```

### 动画时长
```scss
快速：200ms  // 按钮反馈
标准：300ms  // 展开折叠
缓慢：400ms  // 消息进入
```

### 关键动画

#### 消息进入
```scss
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
时长：400ms
```

#### 光标闪烁
```scss
@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
周期：1s
```

#### 打字动画
```scss
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}
周期：1.4s，三个点依次延迟0.2s
```

#### 停止按钮脉冲
```scss
@keyframes stopPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 59, 48, 0); }
}
周期：2s
```

---

## 🖋️ 字体系统

### 字体栈
```scss
font-family: -apple-system, BlinkMacSystemFont, 
  "Segoe UI", "Roboto", "Oxygen", "Ubuntu", 
  "Cantarell", "Fira Sans", "Droid Sans", 
  "Helvetica Neue", sans-serif;
```

### 字体大小
```scss
标题：28px (font-weight: 700)
导航：16px (font-weight: 600)
消息：15px (font-weight: 400)
副文本：14px
提示文字：12px
```

### 行高
```scss
标题：1.2
正文：1.5-1.6
紧凑：1.4
```

### 字体平滑
```scss
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

## 🎭 状态设计

### 加载状态
- **三点跳动**：圆点从左到右依次弹跳
- **颜色**：科技蓝
- **大小**：8px × 8px

### 流式输出状态
- **光标**：2px宽，每秒闪烁一次
- **指示器**：紫蓝色背景，带箭头动画
- **文字**："正在生成..."

### 错误状态
- **背景**：红色半透明 (10% opacity)
- **文字**：错误红
- **图标**：错误图标

### 悬停状态
- **背景变化**：使用hover-bg变量
- **阴影增强**：从sm升至md
- **轻微上移**：transform: translateY(-1px)

---

## 📱 响应式设计

### 断点
```scss
大屏：> 768px
平板：≤ 768px
手机：≤ 480px
```

### 适配规则

#### 平板 (≤ 768px)
- 侧边栏变为覆盖层
- 消息容器padding减小
- 用户消息最大宽度增至90%

#### 手机 (≤ 480px)
- 头像缩小至28px
- 消息间距减小至24px
- 用户消息最大宽度增至95%

---

## 🎪 交互细节

### 点击反馈
```scss
&:active {
  transform: scale(0.96);
}
```

### 悬停提升
```scss
&:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

### 聚焦光环
```scss
&:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-light);
}
```

---

## 🔄 主题切换

### 实现方式
通过 `data-theme` 属性切换：
```html
<html data-theme="light"> <!-- 或 "dark" -->
```

### 过渡效果
```scss
transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

所有颜色变量自动切换，无需额外处理。

---

## 📋 最佳实践

### ✅ DO (推荐)
- 使用CSS变量保持一致性
- 使用标准动画曲线
- 保持适当的留白
- 使用语义化的颜色名称
- 移动端优先考虑
- 保持高对比度（WCAG AA标准）

### ❌ DON'T (避免)
- 不要硬编码颜色值
- 不要使用过度复杂的动画
- 不要忽略深色模式
- 不要使用低对比度配色
- 不要过度使用阴影
- 不要忽略无障碍设计

---

## 🚀 使用示例

### 创建新按钮
```scss
.my-button {
  padding: 12px 20px;
  background: var(--accent-color);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  
  &:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: scale(0.96);
  }
}
```

### 创建卡片
```scss
.my-card {
  background: var(--surface-elevated);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: var(--shadow-lg);
  }
}
```

---

## 🎯 总结

这套设计系统专注于：
- **简洁性**：去除多余装饰
- **一致性**：统一的设计语言
- **现代感**：符合当前设计趋势
- **专业性**：商业级产品质量
- **可维护性**：清晰的变量系统

通过CSS变量和SCSS的组合，实现了高度可定制、易于维护的设计系统。

---

**设计版本**：v2.0  
**最后更新**：2024年  
**维护者**：AI Chat Team

