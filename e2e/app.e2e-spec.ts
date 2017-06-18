import { SimplificaPage } from './app.po';

describe('simplifica App', () => {
  let page: SimplificaPage;

  beforeEach(() => {
    page = new SimplificaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
