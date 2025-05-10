import { PartialType } from "@nestjs/swagger";

import { CreatePreferencesDto } from "./create-preferences.dto.js";

export class UpdatePreferencesDto extends PartialType(CreatePreferencesDto) {}
