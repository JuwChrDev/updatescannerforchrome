import {openMain, paramEnum, actionEnum} from 'main/main_url';
import {PageStore, hasPageStateChanged} from 'page/page_store';
import {Page} from 'page/page';
import * as view from 'popup/popup_view';

/**
 * Class representing the Update Scanner toolbar popup.
 */
export class Popup {
  /**
   * @property {PageStore} pageStore - Object used for saving and loading data
   * from storage.
   */
  constructor() {
    this.pageStore = null;
  }

  /**
   * Initialises the popup data and event handlers.
   */
  async init() {
    this.pageStore = await PageStore.load();
    this.pageStore.bindPageUpdate(this._handlePageUpdate.bind(this));

    view.bindShowAllClick(this._handleShowAllClick.bind(this));
    view.bindNewClick(this._handleNewClick.bind(this));
    view.bindSidebarClick(this._handleSidebarClick.bind(this));
    view.bindPageClick(this._handlePageClick.bind(this));

    this._refreshPageList();
  }

  /**
   * Update the page list to show all pages in the 'changed'' state.
   */
  _refreshPageList() {
    view.clearPageList();
    for (const page of this.pageStore.getPageList()) {
      if (page.state == Page.stateEnum.CHANGED) {
        view.addPage(page);
      }
    }
  }

  /**
   * Called when the New button is clicked, to open the page to create a new
   * scan item.
   */
  _handleNewClick() {
    openMain({[paramEnum.ACTION]: actionEnum.NEW_PAGE});
    window.close();
  }

  /**
   * Called when the Sidebar button is clicked, to open the sidebar.
   */
  _handleSidebarClick() {
    // @TODO: Use sidebar API rather than just opening the main page.
    openMain();
  }

  /**
   * Called when the "Show All Updates" button is clicked, to open all changes
   * in new tabs.
   */
  _handleShowAllClick() {
    for (const page of this.pageStore.getPageList()) {
      if (page.state == Page.stateEnum.CHANGED) {
        openMain({[paramEnum.ACTION]: actionEnum.SHOW_DIFF,
          [paramEnum.ID]: page.id}, true);
      }
    }
    window.close();
  }

  /**
   * Called when an item in the page list is clicked, to view that page.
   *
   * @param {string} pageId - ID of the clicked page.
   */
  _handlePageClick(pageId) {
    if (pageId !== undefined) {
      openMain({[paramEnum.ACTION]: actionEnum.SHOW_DIFF,
        [paramEnum.ID]: pageId});
    }
  }

  /**
   * Called when a Page is updated in Storage. Refresh the page list if its
   * state changed.
   *
   * @param {string} pageId - ID of the changed Page.
   * @param {storage.StorageChange} change - Object representing the change.
   */
  _handlePageUpdate(pageId, change) {
    if (hasPageStateChanged(change)) {
      this._refreshPageList();
    }
  }
}
