import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { extractErrorMessage } from '../../lib/api'
import { formatDuration, formatPrice } from '../../lib/format'
import { serviceService, type CreateServicePayload } from '../../services/serviceService'
import type { Service } from '../../types/scheduling'

interface ServiceFormState {
  name: string
  duration: string
  price: string
}

interface ProviderServicesCrudProps {
  providerId: string
  services: Service[]
  onChange: (services: Service[]) => void
}

function emptyForm(): ServiceFormState {
  return { name: '', duration: '30', price: '' }
}

function formFromService(service: Service): ServiceFormState {
  return {
    name: service.name,
    duration: String(service.durationInMinutes),
    price: (service.priceInCents / 100).toFixed(2),
  }
}

function parseServiceForm(form: ServiceFormState): CreateServicePayload | string {
  const durationInMinutes = Number(form.duration)
  const priceValue = Number(form.price.replace(',', '.'))
  if (!form.name.trim()) return 'Informe o nome do serviço.'
  if (!Number.isInteger(durationInMinutes) || durationInMinutes <= 0) {
    return 'Informe uma duração válida em minutos.'
  }
  if (!Number.isFinite(priceValue) || priceValue < 0) return 'Informe um preço válido.'
  return {
    name: form.name.trim(),
    durationInMinutes,
    priceInCents: Math.round(priceValue * 100),
  }
}

export function ProviderServicesCrud({
  providerId,
  services,
  onChange,
}: ProviderServicesCrudProps) {
  const [createForm, setCreateForm] = useState<ServiceFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ServiceFormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = parseServiceForm(createForm)
    if (typeof parsed === 'string') {
      setError(parsed)
      return
    }

    setIsCreating(true)
    setError(null)
    try {
      const created = await serviceService.create(providerId, parsed)
      onChange([...services, created])
      setCreateForm(emptyForm())
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível cadastrar o serviço.'))
    } finally {
      setIsCreating(false)
    }
  }

  function startEdit(service: Service) {
    setEditingId(service.id)
    setEditForm(formFromService(service))
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm())
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, serviceId: string) {
    event.preventDefault()
    const parsed = parseServiceForm(editForm)
    if (typeof parsed === 'string') {
      setError(parsed)
      return
    }

    setSavingId(serviceId)
    setError(null)
    try {
      const updated = await serviceService.update(providerId, serviceId, parsed)
      onChange(services.map((item) => (item.id === serviceId ? updated : item)))
      cancelEdit()
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível atualizar o serviço.'))
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(service: Service) {
    const confirmed = window.confirm(`Remover o serviço "${service.name}"?`)
    if (!confirmed) return

    setDeletingId(service.id)
    setError(null)
    try {
      await serviceService.remove(providerId, service.id)
      onChange(services.filter((item) => item.id !== service.id))
      if (editingId === service.id) cancelEdit()
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível remover o serviço.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-[24px] border border-[#ECE6E2] bg-white shadow-sm">
      <div className="border-b border-[#ECE6E2] px-6 py-5">
        <h2 className="font-outfit text-lg font-bold text-gray-900">Serviços</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie o catálogo que os clientes veem ao agendar.
        </p>
      </div>

      <div className="px-6 py-5">
        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}

        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ECE6E2] px-4 py-8 text-center text-sm text-gray-500">
            Nenhum serviço cadastrado. Adicione o primeiro abaixo.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#ECE6E2]">
            <table className="min-w-full divide-y divide-[#ECE6E2] text-sm">
              <thead className="bg-[#FAF6F4]/50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Serviço</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Duração</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Preço</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700 uppercase tracking-wider text-xs">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6E2] bg-white">
                {services.map((service) =>
                  editingId === service.id ? (
                    <tr key={service.id} className="bg-[#FAF6F4]/40">
                      <td colSpan={4} className="px-4 py-4">
                        <form
                          onSubmit={(event) => handleUpdate(event, service.id)}
                          className="grid gap-3 sm:grid-cols-4"
                        >
                          <TextField
                            id={`edit-name-${service.id}`}
                            label="Nome"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                          />
                          <TextField
                            id={`edit-duration-${service.id}`}
                            label="Duração (min)"
                            type="number"
                            min={1}
                            value={editForm.duration}
                            onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                            required
                          />
                          <TextField
                            id={`edit-price-${service.id}`}
                            label="Preço (R$)"
                            type="number"
                            min={0}
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            required
                          />
                          <div className="flex items-end gap-2">
                            <Button type="submit" isLoading={savingId === service.id} className="rounded-xl bg-[#E65F2B] hover:bg-[#c54e20]">
                              Salvar
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
                      </td>
                    </tr>
                  ) : (
                    <tr key={service.id} className="hover:bg-[#FAF6F4]/10 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900">{service.name}</td>
                      <td className="px-4 py-3 font-medium text-gray-600">
                        {formatDuration(service.durationInMinutes)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-750">
                        {formatPrice(service.priceInCents)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(service)}
                            className="rounded-xl px-3 py-1.5 text-sm font-bold text-[#E65F2B] hover:bg-[#F9EBE6] transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(service)}
                            disabled={deletingId === service.id}
                            className="rounded-xl px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
                          >
                            {deletingId === service.id ? 'Removendo...' : 'Excluir'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-[#ECE6E2] bg-[#FAF6F4]/40 px-6 py-6 rounded-b-[24px]">
        <h3 className="font-outfit text-sm font-bold text-gray-900 uppercase tracking-wider">Novo serviço</h3>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-4">
          <TextField
            id="create-service-name"
            label="Nome"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Corte masculino"
            required
          />
          <TextField
            id="create-service-duration"
            label="Duração (min)"
            type="number"
            min={1}
            value={createForm.duration}
            onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
            required
          />
          <TextField
            id="create-service-price"
            label="Preço (R$)"
            type="number"
            min={0}
            step="0.01"
            value={createForm.price}
            onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
            placeholder="40.00"
            required
          />
          <div className="flex items-end">
            <Button type="submit" isLoading={isCreating} className="w-full rounded-xl bg-[#E65F2B] hover:bg-[#c54e20]">
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
