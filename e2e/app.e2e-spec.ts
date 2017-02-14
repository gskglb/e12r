import { VenturePage } from './app.po';

describe('venture App', function() {
  let page: VenturePage;

  beforeEach(() => {
    page = new VenturePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
