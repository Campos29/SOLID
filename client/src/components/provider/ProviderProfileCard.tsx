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
    <section className="rounded-[24px] border border-[#ECE6E2] bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-[#ECE6E2] px-6 py-5">
        <div>
          <h2 className="font-outfit text-lg font-bold text-gray-900">Perfil público</h2>
          <p className="mt-1 text-sm text-gray-500">Como você aparece no catálogo de prestadores.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl border border-[#ECE6E2] bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-[#FAF6F4] hover:text-[#E65F2B] transition-all"
          >
            Editar Perfil
          </button>
        )}
      </div>

      <div className="px-6 py-6">
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
              <label htmlFor="profile-description" className="text-sm font-semibold text-gray-700">
                Descrição
              </label>
              <textarea
                id="profile-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="rounded-xl border border-[#ECE6E2] px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B] transition-colors"
              />
            </div>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-100">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isSaving} className="rounded-xl bg-[#E65F2B] hover:bg-[#c54e20]">
                Salvar alterações
              </Button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-[#ECE6E2] px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nome</p>
              <p className="mt-1 text-base font-bold text-gray-900">{provider.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Categoria</p>
              <span className="mt-1 inline-block rounded-lg bg-[#FAF6F4] px-2.5 py-1 text-xs font-semibold text-[#E65F2B] border border-[#E65F2B]/10">
                {provider.category}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Descrição</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {provider.description || 'Sem descrição cadastrada.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <StarRating value={Math.round(provider.averageRating ?? 0)} readOnly size="sm" />
              <span className="text-sm font-medium text-gray-500">
                {provider.averageRating ? formatRating(provider.averageRating) : 'Sem avaliações'}
                {provider.reviewCount ? ` (${provider.reviewCount})` : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#ECE6E2] px-6 py-4 bg-[#FAF6F4]/40 rounded-b-[24px]">
        <Link
          to="/availability"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#E65F2B] hover:text-[#c54e20] transition-colors"
        >
          Configurar disponibilidade semanal →
        </Link>
      </div>
    </section>
  )
}
