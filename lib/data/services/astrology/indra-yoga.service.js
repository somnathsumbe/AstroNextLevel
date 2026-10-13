import { getIndraYogaData } from '@/lib/data/repositories/astrology/indra-yoga.repository';
import { validateIndraYogaEntries } from '@/lib/indra-yoga-utils';

export const indraYogaService = {
  getData() {
    const data = getIndraYogaData();
    validateIndraYogaEntries(data.entries);
    return data.entries;
  },
};
