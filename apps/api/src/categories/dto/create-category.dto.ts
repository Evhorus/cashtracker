import {
  CATEGORY_LABEL_MAX_LENGTH,
  ICON_KEYS,
  PRESET_COLORS,
  type IconKey,
  type PresetColor,
} from '@cashtracker/shared';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { normalizeString } from '@/common/utils/string-utils';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(CATEGORY_LABEL_MAX_LENGTH)
  @Transform(({ value }) => normalizeString(value))
  label: string;

  @IsIn(PRESET_COLORS)
  color: PresetColor;

  @IsIn(ICON_KEYS)
  icon: IconKey;
}
