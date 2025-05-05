import { PartialType } from "@nestjs/mapped-types";

import { CreatePreferencesDto } from "./create-preferences.dto.js";

export class UpdatePreferencesDto extends PartialType(CreatePreferencesDto) {}
