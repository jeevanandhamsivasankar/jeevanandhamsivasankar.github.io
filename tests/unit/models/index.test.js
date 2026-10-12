import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as barrel from '../../../src/models/index.js'
import * as factories from '../../../src/models/createModels.js'
import * as validators from '../../../src/models/validate.js'

const read = (rel) => readFileSync(resolve(process.cwd(), rel), 'utf8')

describe('UNIT-INDEX / UNIT-MODELS_INDEX', () => {
  it('UT-INDEX-001 re-exports all factories, ModelValidationError and the validators by reference', () => {
    const factoryNames = Object.keys(factories).filter((k) => /^create[A-Z]/.test(k))
    expect(factoryNames.length).toBeGreaterThanOrEqual(13)
    for (const name of factoryNames) expect(barrel[name], name).toBe(factories[name])
    expect(barrel.ModelValidationError).toBe(validators.ModelValidationError)
    for (const name of Object.keys(validators)) expect(barrel[name], name).toBe(validators[name])
    for (const name of Object.keys(factories)) expect(barrel[name], name).toBe(factories[name])
  })

  it('UT-MODELS_INDEX-001 every factory name, ModelValidationError and deepFreeze are exported functions', () => {
    const names = [
      'createRichText', 'createPhoto', 'createStat', 'createProfile', 'createResumeSkill',
      'createResumePreview', 'createSection', 'createExperience', 'createSkill', 'createSkillCategory',
      'createHighlight', 'createProject', 'createDesignCard', 'createEducation', 'createCertification',
      'createContactLink', 'ModelValidationError', 'deepFreeze',
    ]
    for (const n of names) expect(typeof barrel[n], n).toBe('function')
  })

  it('UT-INDEX-002 has no default export and imports no React (static)', () => {
    expect('default' in barrel).toBe(false)
    const src = read('src/models/index.js')
    expect(src).not.toMatch(/export\s+default/)
    expect(src).not.toMatch(/from\s+["']react/)
    expect(src).not.toMatch(/\bimport\s+.*react/i)
  })
})
