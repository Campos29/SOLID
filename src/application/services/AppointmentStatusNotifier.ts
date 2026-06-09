import {
  AppointmentStatusChangeEvent,
  IAppointmentStatusObserver,
  IAppointmentStatusPublisher,
} from '@domain/interfaces/IAppointmentStatusObserver';

export class AppointmentStatusNotifier implements IAppointmentStatusPublisher {
  private readonly observers = new Set<IAppointmentStatusObserver>();

  subscribe(observer: IAppointmentStatusObserver): this {
    this.observers.add(observer);
    return this;
  }

  unsubscribe(observer: IAppointmentStatusObserver): this {
    this.observers.delete(observer);
    return this;
  }

  async publish(event: AppointmentStatusChangeEvent): Promise<void> {
    await Promise.all([...this.observers].map(observer => observer.update(event)));
  }
}
