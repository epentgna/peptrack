import type { Compound } from '../types'

/**
 * Biblioteca inicial — 12 compostos com ficha educacional.
 * defaultDoseMcg é SEMPRE null: o app nunca sugere dose. O usuário define
 * a própria dose no protocolo. Apenas para referência educacional.
 */
export const SEED_COMPOUNDS: Omit<Compound, 'id'>[] = [
  {
    name: '5-Amino-1MQ',
    category: 'Outro',
    halfLife: 'Não bem caracterizada',
    cycleNote: 'Uso oral em ciclos; observar resposta individual.',
    description:
      'Pequena molécula estudada por inibir a NNMT, enzima ligada ao metabolismo celular e à regulação de gordura. Interesse em composição corporal e vitalidade metabólica.',
    notes:
      'Costuma ser administrado por via oral (cápsula), sem reconstituição. Guardar em local seco e ao abrigo da luz.',
    route: 'Oral',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'AOD-9604',
    category: 'Metabólico',
    halfLife: '~20 min (plasma)',
    cycleNote: 'Frequentemente usado em jejum; ciclos contínuos.',
    description:
      'Fragmento do hormônio do crescimento (fração 176-191) estudado por seu papel na mobilização de gordura sem os efeitos sistêmicos amplos do GH.',
    notes:
      'Reconstituir com água bacteriostática e manter refrigerado. Sensível à agitação vigorosa.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Tesamorelina', 'CJC-1295 (no DAC)']
  },
  {
    name: 'BPC-157',
    category: 'Cicatrização',
    halfLife: '~4 h',
    cycleNote: 'Ciclos de reparo tecidual; pausas conforme objetivo.',
    description:
      'Peptídeo derivado de uma proteína gástrica, estudado por propriedades de reparo tecidual, angiogênese e proteção de tendões, ligamentos e mucosa.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Pode ser aplicado próximo à região-alvo ou de forma sistêmica.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['TB-500', 'GHK-Cu']
  },
  {
    name: 'Cerebrolysin',
    category: 'Cognitivo',
    halfLife: 'Ação neurotrófica prolongada',
    cycleNote: 'Aplicado em séries/ciclos; costuma seguir esquemas de dias.',
    description:
      'Mistura de peptídeos neurotróficos de baixo peso molecular estudada por suporte neuronal, plasticidade e função cognitiva.',
    notes:
      'Apresentação normalmente em ampola líquida pronta. Guardar conforme rótulo; proteger da luz.',
    route: 'Intramuscular / Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'CJC-1295 (no DAC)',
    category: 'GH',
    halfLife: '~30 min (sem DAC)',
    cycleNote: 'Costuma ser pulsado; frequentemente combinado com GHRP.',
    description:
      'Análogo de GHRH (versão sem Drug Affinity Complex) estudado por estimular pulsos de hormônio do crescimento respeitando o ritmo fisiológico.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. A versão sem DAC tem ação curta e é usada em pulsos.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Tesamorelina', 'AOD-9604']
  },
  {
    name: 'Dihexa',
    category: 'Cognitivo',
    halfLife: 'Prolongada (alta estabilidade)',
    cycleNote: 'Ciclos curtos; observar resposta cognitiva.',
    description:
      'Peptídeo derivado da angiotensina IV estudado por potente atividade sinaptogênica e interesse em memória e aprendizado.',
    notes:
      'Alta lipofilicidade. Seguir orientação de reconstituição/veículo do fornecedor; proteger da luz.',
    route: 'Oral / Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Epitalon',
    category: 'Outro',
    halfLife: 'Curta (ação sinalizadora)',
    cycleNote: 'Ciclos curtos e periódicos (ex.: séries de dias).',
    description:
      'Tetrapeptídeo (Epithalon) estudado por sua relação com a telomerase e a regulação do relógio biológico e do sono.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Costuma ser aplicado em séries curtas.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'GHK-Cu',
    category: 'Cicatrização',
    halfLife: 'Curta no plasma',
    cycleNote: 'Uso contínuo ou em ciclos de reparo/pele.',
    description:
      'Tripeptídeo de cobre estudado por remodelação de pele, cicatrização, produção de colágeno e efeito antioxidante.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Coloração azulada é característica do cobre.',
    route: 'Subcutânea / Tópica',
    defaultDoseMcg: null,
    stackWith: ['BPC-157', 'TB-500']
  },
  {
    name: 'Retatrutide',
    category: 'Metabólico',
    halfLife: 'Longa (aplicação semanal)',
    cycleNote: 'Titulação gradual; aplicação tipicamente semanal.',
    description:
      'Agonista triplo de receptores (GLP-1, GIP e glucagon) em estudo para controle de peso e regulação metabólica.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Titular de forma gradual conforme tolerância.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Selank',
    category: 'Cognitivo',
    halfLife: 'Curta (peptídeo)',
    cycleNote: 'Ciclos curtos; uso conforme necessidade.',
    description:
      'Peptídeo ansiolítico derivado da tuftsina, estudado por modulação de ansiedade, foco e equilíbrio imunológico sem sedação marcante.',
    notes:
      'Disponível em solução para uso subcutâneo ou intranasal. Refrigerar após reconstituição.',
    route: 'Subcutânea / Intranasal',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Tesamorelina',
    category: 'GH',
    halfLife: '~26-38 min',
    cycleNote: 'Uso contínuo; frequentemente noturno.',
    description:
      'Análogo estabilizado de GHRH estudado por estimular hormônio do crescimento, com interesse em gordura visceral.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Homogeneizar com movimentos suaves, sem agitar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['CJC-1295 (no DAC)', 'AOD-9604']
  },
  {
    name: 'TB-500',
    category: 'Cicatrização',
    halfLife: 'Prolongada (fração de timosina β4)',
    cycleNote: 'Fase de carga seguida de manutenção em muitos protocolos.',
    description:
      'Fração sintética da timosina beta-4 estudada por reparo tecidual, flexibilidade, angiogênese e migração celular.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Frequentemente combinado com BPC-157.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['BPC-157', 'GHK-Cu']
  }
]
