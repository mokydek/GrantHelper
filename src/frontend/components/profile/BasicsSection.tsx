import { forwardRef, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Label, Select } from '../ui'
import { useProfile } from '../../providers/ProfileProvider'
import { updateMyProfile } from '../../../backend/services/profileService'
import {
  COUNTRIES,
  CURRENT_LEVELS,
  TARGET_LEVELS,
  type SectionHandle,
} from './shared'
import type { CurrentLevel, DegreeLevel } from '../../../backend/types/database'

const BasicsSection = forwardRef<SectionHandle>((_props, ref) => {
  const { t } = useTranslation()
  const { profile, refresh } = useProfile()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [citizenship, setCitizenship] = useState(profile?.citizenship ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth ?? '')
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel | ''>(
    profile?.current_level ?? '',
  )
  const [targetLevel, setTargetLevel] = useState<DegreeLevel | ''>(
    profile?.target_level ?? '',
  )
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.field_of_study ?? '')
  const [errors, setErrors] = useState<{ fullName?: string }>({})

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (fullName.trim().length === 0) {
        setErrors({ fullName: t('profile.validation.fullNameRequired') })
        return false
      }
      setErrors({})
      await updateMyProfile({
        full_name: fullName.trim(),
        citizenship: citizenship || null,
        date_of_birth: dateOfBirth || null,
        current_level: currentLevel || null,
        target_level: targetLevel || null,
        field_of_study: fieldOfStudy.trim() || null,
      })
      await refresh()
      return true
    },
  }))

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="basics-name">{t('profile.fields.fullName')}</Label>
        <Input
          id="basics-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          error={errors.fullName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="basics-citizenship">
          {t('profile.fields.citizenship')}
        </Label>
        <Select
          id="basics-citizenship"
          value={citizenship}
          onChange={(event) => setCitizenship(event.target.value)}
        >
          <option value="">{t('profile.selectPlaceholder')}</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {t(`profile.countries.${country}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="basics-dob">{t('profile.fields.dateOfBirth')}</Label>
        <Input
          id="basics-dob"
          type="date"
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="basics-current">
          {t('profile.fields.currentLevel')}
        </Label>
        <Select
          id="basics-current"
          value={currentLevel}
          onChange={(event) =>
            setCurrentLevel(event.target.value as CurrentLevel | '')
          }
        >
          <option value="">{t('profile.selectPlaceholder')}</option>
          {CURRENT_LEVELS.map((level) => (
            <option key={level} value={level}>
              {t(`profile.levels.${level}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="basics-target">{t('profile.fields.targetLevel')}</Label>
        <Select
          id="basics-target"
          value={targetLevel}
          onChange={(event) =>
            setTargetLevel(event.target.value as DegreeLevel | '')
          }
        >
          <option value="">{t('profile.selectPlaceholder')}</option>
          {TARGET_LEVELS.map((level) => (
            <option key={level} value={level}>
              {t(`profile.levels.${level}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="basics-field">{t('profile.fields.fieldOfStudy')}</Label>
        <Input
          id="basics-field"
          value={fieldOfStudy}
          onChange={(event) => setFieldOfStudy(event.target.value)}
        />
      </div>
    </div>
  )
})

BasicsSection.displayName = 'BasicsSection'

export default BasicsSection
