const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string {
  if (!emailPattern.test(email.trim())) return '请输入有效的邮箱地址'
  return ''
}

export function validateCredentials(email: string, password: string): string {
  const emailError = validateEmail(email)
  if (emailError) return emailError
  if (password.length < 8) return '密码至少需要 8 位'
  return ''
}
