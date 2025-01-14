import * as view from './popup_view.js';
import {openMain, showAllChanges, paramEnum, actionEnum}
  from '/lib/main/main_url.js';
import {backgroundActionEnum} from '/lib/background/actions.js';
import {PageStore, hasPageStateChanged, isItemChanged}
  from '/lib/page/page_store.js';
import {createBackupJson} from '/lib/backup/backup.js';
import {openRestoreUrl} from '/lib/backup/restore_url.js';
import {waitForMs} from '/lib/util/promise.js';

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
    // Small delay to allow popup to render
    await waitForMs(100);

    this.pageStore = await PageStore.load();
    this.pageStore.bindPageUpdate(this._handlePageUpdate.bind(this));

    view.init();
    view.bindShowAllClick(this._handleShowAllClick.bind(this));
    view.bindNewClick(this._handleNewClick.bind(this));
    view.bindSidebarClick(this._handleSidebarClick.bind(this));
    view.bindScanAllClick(this._handleScanAllClick.bind(this));
    view.bindBackupClick(this._handleBackupClick.bind(this));
    view.bindRestoreClick(this._handleRestoreClick.bind(this));
    view.bindHelpClick(this._handleHelpClick.bind(this));
    view.bindPageClick(this._handlePageClick.bind(this));

    this._refreshPageList();
  }

  /**
   * Update the page list to show all pages in the 'changed'' state.
   */
  _refreshPageList() {
    view.clearPageList();
    this.pageStore.getPageList()
      .filter(isItemChanged)
      .map(view.addPage);
  }

  /**
   * Called when the New button is clicked, to open the page to create a new
   * scan item.
   */
  async _handleNewClick() {
    const tabs = await browser.tabs.query({currentWindow: true, active: true});
    openMain({
      [paramEnum.ACTION]: actionEnum.NEW_PAGE,
      [paramEnum.TITLE]: tabs[0].title,
      [paramEnum.URL]: tabs[0].url,
    }, true);
    window.close();
  }

  /**
   * Called when the Sidebar button is clicked, to open the sidebar.
   */
  _handleSidebarClick() {
    //browser.sidebarAction.open();
    //window.close();
    const url = browser.extension.getURL('/app/main/main.html');
    browser.tabs.create({url: url});
  }

  /**
   * Called when the Scan All menu item is clicked, to scan all pages.
   */
  _handleScanAllClick() {
    browser.runtime.sendMessage({action: backgroundActionEnum.SCAN_ALL});
    window.close();
  }

  /**
   * Called when the Backup menu item is clicked, to backup pages to a file.
   */
  async _handleBackupClick() {
	window.close();
    const blob = new Blob(
      [createBackupJson(this.pageStore)],
      {type: 'application/json'}
    );
    const url = URL.createObjectURL(blob);
	var now = new Date();
	var year = '' + now.getFullYear();
	var month = '' + (now.getMonth() + 1); if (month.length == 1) { month = '0' + month; }
	var day = '' + now.getDate(); if (day.length == 1) { day = '0' + day; }
	var hour = '' + now.getHours(); if (hour.length == 1) { hour = '0' + hour; }
	var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = '0' + minute; }
	var second = "" + now.getSeconds(); if (second.length == 1) { second = '0' + second; }
	var name = 'Backup_' + year + '_' + month + '_' + day + 'T' + hour + '_' + minute + '_' + second;
	
    await view.downloadUrl(url, name);
    URL.revokeObjectURL(url);
  }

  /**
   * Called when the Restore menu item is clicked, to restore pages from a file.
   */
  async _handleRestoreClick() {
    openRestoreUrl();
    window.close();
  }

  /**
   * Called when the Help menu item is clicked, to open the help website.
   */
  _handleHelpClick() {
    browser.tabs.create({url:
      'https://sneakypete81.github.io/updatescanner/'});
    window.close();
  }

  /**
   * Called when the "Show All Updates" button is clicked, to open all changes
   * in new tabs.
   */
  async _handleShowAllClick() {
    await showAllChanges();
    window.close();
  }

  /**
   * Called when an item in the page list is clicked, to view that page.
   *
   * @param {string} pageId - ID of the clicked page.
   */
  _handlePageClick(pageId) {
    if (pageId !== undefined) {
      const params = {
        [paramEnum.ACTION]: actionEnum.SHOW_DIFF,
        [paramEnum.ID]: pageId,
      };
      openMain(params, true);
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
