import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { useAuth } from '../context/authContext'
import { extractErrorMessage } from '../lib/api'
import { USER_ROLES } from '../types/auth'
import type { UserRole } from '../types/auth'

const ROLE_LABELS: Record<UserRole, string> = {
  Client: 'Cliente — quero agendar serviços',
  Provider: 'Prestador — quero oferecer serviços',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('Client')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    setIsSubmitting(true)
    try {
      await register({ name, email, password, role })
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível concluir o cadastro.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para começar a usar o SlotWise."
      footer={
        <>
          Já possui uma conta?{' '}
          <Link to="/login" className="font-semibold text-[#E65F2B] hover:text-[#D04F1D] hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100"
          >
            {error}
          </p>
        )}

        <TextField
          id="name"
          label="Nome completo"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          required
        />

        <TextField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <TextField
          id="password"
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-semibold text-gray-700">
            Tipo de conta
          </label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="rounded-2xl border border-[#ECE6E2] bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B]"
          >
            {USER_ROLES.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          Cadastrar
        </Button>
      </form>
    </AuthLayout>
  )
}
