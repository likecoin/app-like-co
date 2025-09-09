import './stub'
import { mount } from '@vue/test-utils'
import UploadForm from '~/components/IscnUploadedInfo.vue'

describe('UploadForm', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(UploadForm, {
      mocks: {
        $t: (key) => key,
        localeLocation: () => {},
      },
    })
    expect(wrapper.vm).toBeTruthy()
  })
})
