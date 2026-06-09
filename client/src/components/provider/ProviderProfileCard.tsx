import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { StarRating } from '../StarRating'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { extractErrorMessage } from '../../lib/api'
import { formatRating } from '../../lib/format'
import { providerService } from '../../services/providerService'
import type { Provider } from '../../types/scheduling'

interface ProviderProfileCardProps {
  provider: Provider
  onUpdate: (provider: Provider) => void
}

export function ProviderProfileCard({ provider, onUpdate }: ProviderProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(provider.name)
  const [category, setCategory] = useState(provider.category)
  const [description, setDescription] = useState(provider.description)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(provider.name)
    setCategory(provider.category)
    setDescription(provider.description)
  }, [provider])

  function cancelEdit() {
    setIsEditing(false)
    setName(provider.name)
    setCategory(provider.category)
    setDescription(provider.description)
    setError(null)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      const updated = await providerService.update(provider.id, {
        name: name.trim(),
        category: category.trim(),
        description: description.trim() || undefined,
      })
      onUpdate(updated)
      setIsEditing(false)
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível atualizar o perfil.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Perfil público</h2>
          <p className="mt-1 text-sm text-gray-500">Como você aparece no catálogo de prestadores.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Editar
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <TextField
              id="profile-name"
              label="Nome público"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              id="profile-category"
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-description" className="text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="profile-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <Button type="submit" isLoading={isSaving}>
                Salvar alterações
              </Button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Nome</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{provider.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Categoria</p>
              <p className="mt-1 text-sm text-gray-700">{provider.category}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Descrição</p>
              <p className="mt-1 text-sm text-gray-600">
                {provider.description || 'Sem descrição cadastrada.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <StarRating value={Math.round(provider.averageRating ?? 0)} readOnly size="sm" />
              <span className="text-sm text-gray-500">
                {provider.averageRating ? formatRating(provider.averageRating) : 'Sem avaliações'}
                {provider.reviewCount ? ` (${provider.reviewCount})` : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-6 py-4">
        <Link
          to="/availability"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Configurar disponibilidade semanal →
        </Link>
      </div>
    </section>
  )
}
