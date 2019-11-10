from clickshot.matchers import visible, eventually_visible
from hamcrest import assert_that, is_
import pyautogui
import pytest

from regions.debug_info import debug_info
from regions.page_settings import page_settings
from regions.page_view import page_view
from regions.sidebar import sidebar


@pytest.mark.usefixtures("firefox")
class TestPageView:
    def test_page_settings_can_be_opened(self):
        sidebar.updatescanner_website_item.click()
        page_view.settings_button.click()
        page_view.page_settings_menu_item.click()

        assert_that(page_settings.update_scanner_website, is_(eventually_visible()))

    def test_debug_info_can_be_opened(self):
        sidebar.updatescanner_website_item.click()
        page_view.settings_button.click()
        page_view.debug_info_menu_item.click()

        assert_that(debug_info.title, is_(eventually_visible()))

    def test_page_settings_can_adjust_parameters(self):
        sidebar.updatescanner_website_item.click()
        page_view.settings_button.click()
        page_view.page_settings_menu_item.click()

        page_settings.autoscan_often.click()
        pyautogui.press(["left"]*10)
        page_settings.change_threshold_low.click()
        pyautogui.press(["left"]*10)
        page_settings.ok_button.click()

        page_view.settings_button.click()
        page_view.debug_info_menu_item.click()

        assert_that(debug_info.title, is_(eventually_visible()))
        assert_that(debug_info.scan_rate_minutes_5, is_(visible()))
        assert_that(debug_info.change_threshold_0, is_(visible()))
