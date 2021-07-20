import './stub';
import { mount } from '@vue/test-utils'
import UploadForm from '@/components/UploadForm.vue'

describe('UploadForm', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(UploadForm)
    expect(wrapper.vm).toBeTruthy()
  })
})
