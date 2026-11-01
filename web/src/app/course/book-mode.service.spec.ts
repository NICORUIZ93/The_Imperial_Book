import { BookModeService } from './book-mode.service';

const STORAGE_KEY = 'academia-floci-book-mode';

describe('BookModeService', () => {
  beforeEach(() => localStorage.clear());

  it('abre en modo libro cuando no hay preferencia guardada', () => {
    expect(new BookModeService().enabled()).toBe(true);
  });

  it('recuerda el modo continuo entre instancias', () => {
    const service = new BookModeService();
    service.setEnabled(false);

    expect(localStorage.getItem(STORAGE_KEY)).toBe('off');
    expect(new BookModeService().enabled()).toBe(false);
  });

  it('alterna y persiste el valor contrario', () => {
    const service = new BookModeService();
    service.setEnabled(false);
    service.toggle();

    expect(service.enabled()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('on');
  });

  it('ignora un valor guardado desconocido', () => {
    localStorage.setItem(STORAGE_KEY, 'quizá');

    expect(new BookModeService().enabled()).toBe(true);
  });
});
