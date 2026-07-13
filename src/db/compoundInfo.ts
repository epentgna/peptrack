/**
 * Conteúdo educacional adicional por composto (exibido na ficha).
 * Estático — não vai ao banco nem à sincronização, então não requer
 * migração. Compostos personalizados simplesmente não têm entrada aqui.
 *
 * Apenas para referência educacional. Não constitui orientação médica.
 */
export interface CompoundInfo {
  mechanism?: string // como age
  uses?: string // usos estudados
  cautions?: string // cuidados / efeitos comuns
}

export const COMPOUND_INFO: Record<string, CompoundInfo> = {
  '5-Amino-1MQ': {
    mechanism:
      'Inibe a enzima NNMT, o que tende a elevar NAD+ e SAM e a modular o metabolismo dos adipócitos.',
    uses: 'Estudado para composição corporal, gordura e vitalidade metabólica.',
    cautions:
      'Molécula pequena, dados humanos limitados. Uso oral; observar resposta individual.'
  },
  'AOD-9604': {
    mechanism:
      'Fragmento 176-191 do GH que estimula a lipólise sem os efeitos amplos do hormônio do crescimento sobre glicose/IGF-1.',
    uses: 'Estudado para mobilização de gordura; frequentemente usado em jejum.',
    cautions: 'Meia-vida curta. Sensível a calor e agitação; manter refrigerado.'
  },
  'BPC-157': {
    mechanism:
      'Promove angiogênese, sinalização de fatores de crescimento e regulação do óxido nítrico, favorecendo reparo tecidual.',
    uses: 'Reparo de tendões, ligamentos, músculo e mucosa gástrica em modelos animais.',
    cautions:
      'Evidência majoritariamente pré-clínica. Não aprovado para uso humano; pureza/esterilidade dependem da fonte.'
  },
  Cerebrolysin: {
    mechanism:
      'Mistura de peptídeos neurotróficos de baixo peso que imitam fatores de crescimento neural e apoiam a plasticidade.',
    uses: 'Estudado em função cognitiva, AVC e neurodegeneração.',
    cautions: 'Aplicado em séries/ciclos. Proteger da luz; seguir o rótulo da ampola.'
  },
  'CJC-1295 (no DAC)': {
    mechanism:
      'Análogo de GHRH (Mod GRF 1-29) que induz pulsos curtos e fisiológicos de GH pela hipófise.',
    uses: 'GH/IGF-1; sinérgico com GHRP como Ipamorelin.',
    cautions:
      'Versão sem DAC tem ação curta (uso pulsado). Retenção hídrica e formigamento podem ocorrer.'
  },
  Dihexa: {
    mechanism:
      'Derivado da angiotensina IV que potencia o sistema HGF/c-Met, favorecendo sinaptogênese.',
    uses: 'Estudado por memória e aprendizado; alta potência sinaptogênica.',
    cautions: 'Muito lipofílico; dados humanos escassos. Proteger da luz.'
  },
  Epitalon: {
    mechanism:
      'Tetrapeptídeo que modula a telomerase e a função pineal (melatonina/ritmo circadiano).',
    uses: 'Estudado por longevidade, sono e regulação do relógio biológico.',
    cautions: 'Usado em séries curtas e periódicas. Evidência humana limitada.'
  },
  'GHK-Cu': {
    mechanism:
      'Tripeptídeo de cobre que ativa remodelação da matriz, síntese de colágeno e vias antioxidantes.',
    uses: 'Cicatrização, rejuvenescimento da pele e cabelo; também tópico.',
    cautions: 'Coloração azulada é do cobre. Injeção pode arder; rotacionar locais.'
  },
  Retatrutide: {
    mechanism:
      'Agonista triplo de GLP-1, GIP e receptor de glucagon, atuando em apetite e gasto energético.',
    uses: 'Em ensaios para perda de peso e controle metabólico, com efeito potente.',
    cautions:
      'Titular devagar. Náusea e efeitos gastrointestinais são comuns no início.'
  },
  Selank: {
    mechanism:
      'Derivado da tuftsina que modula GABA/serotonina e a expressão de BDNF, com efeito ansiolítico.',
    uses: 'Ansiedade, foco e equilíbrio imunológico sem sedação marcante.',
    cautions: 'Disponível também intranasal. Efeitos costumam ser sutis e agudos.'
  },
  Tesamorelina: {
    mechanism:
      'Análogo estabilizado de GHRH que aumenta o GH endógeno e reduz gordura visceral.',
    uses: 'Aprovado para lipodistrofia associada ao HIV; estudado em gordura visceral.',
    cautions: 'Homogeneizar sem agitar. Pode elevar glicose e causar retenção hídrica.'
  },
  'TB-500': {
    mechanism:
      'Fração da timosina β4 que regula actina, migração celular, angiogênese e reduz fibrose.',
    uses: 'Reparo tecidual e flexibilidade; clássico par do BPC-157 ("Wolverine").',
    cautions: 'Evidência pré-clínica. Fase de carga seguida de manutenção em muitos protocolos.'
  },
  Ipamorelin: {
    mechanism:
      'GHRP seletivo agonista do receptor de grelina; libera GH sem elevar cortisol/prolactina de forma relevante.',
    uses: 'GH "limpo"; base de stacks com CJC-1295/GHRH.',
    cautions: 'O mais bem tolerado da classe. Aplicar em pulsos (ex.: antes de dormir).'
  },
  Sermorelina: {
    mechanism:
      'Análogo de GHRH (1-29) que estimula a liberação natural e pulsátil de GH.',
    uses: 'Suporte ao eixo GH/IGF-1, frequentemente noturno.',
    cautions: 'Ação muito curta. Rubor no local pode ocorrer.'
  },
  'GHRP-2': {
    mechanism:
      'Agonista de grelina que libera GH de forma potente; pode elevar levemente apetite e prolactina.',
    uses: 'GH; combinado com um GHRH para efeito sinérgico.',
    cautions: 'Mais estímulo de cortisol/prolactina que o Ipamorelin.'
  },
  'GHRP-6': {
    mechanism:
      'Forte agonista de grelina — libera GH e ativa marcadamente a fome.',
    uses: 'GH e estímulo de apetite (útil quando se busca ganho).',
    cautions: 'Aumento de apetite acentuado e retenção hídrica são comuns.'
  },
  Hexarelina: {
    mechanism:
      'GHRP muito potente; ativa forte liberação de GH, mas gera dessensibilização com uso contínuo.',
    uses: 'GH em ciclos curtos.',
    cautions: 'Tolerância rápida — costuma ser ciclado com pausas.'
  },
  'MK-677 (Ibutamoren)': {
    mechanism:
      'Mimético de grelina ativo por via oral que eleva GH e IGF-1 de forma sustentada por ~24 h.',
    uses: 'GH/IGF-1 sem injeção; sono e apetite.',
    cautions:
      'Aumenta apetite, retenção hídrica e pode elevar glicemia. Uso oral diário.'
  },
  'IGF-1 LR3': {
    mechanism:
      'Análogo de IGF-1 de ação longa que ativa diretamente receptores de IGF-1 (anabólico).',
    uses: 'Sinalização anabólica e reparo; ação prolongada (~20-30 h).',
    cautions: 'Pode causar hipoglicemia. Sensível a calor e agitação.'
  },
  Semaglutida: {
    mechanism:
      'Agonista de GLP-1 que aumenta saciedade, retarda o esvaziamento gástrico e melhora a glicemia.',
    uses: 'Aprovado para diabetes e obesidade (redução de peso robusta).',
    cautions:
      'Náusea/constipação comuns no início; titular devagar. Aplicação semanal.'
  },
  Tirzepatida: {
    mechanism:
      'Agonista duplo de GIP e GLP-1, com efeito metabólico e de perda de peso ainda maior.',
    uses: 'Aprovado para diabetes e obesidade.',
    cautions: 'Efeitos gastrointestinais no início; titulação gradual. Semanal.'
  },
  'MOTS-c': {
    mechanism:
      'Peptídeo codificado no genoma mitocondrial que ativa AMPK e melhora a sensibilidade à insulina.',
    uses: 'Metabolismo, sensibilidade à insulina e desempenho.',
    cautions: 'Dados humanos iniciais. Usado em ciclos.'
  },
  'SS-31 (Elamipretida)': {
    mechanism:
      'Liga-se à cardiolipina na membrana mitocondrial interna, estabilizando a produção de energia.',
    uses: 'Função mitocondrial, energia celular e condições de fadiga.',
    cautions: 'Em investigação clínica; evidência ainda em construção.'
  },
  Semax: {
    mechanism:
      'Derivado do ACTH (4-10) que eleva BDNF/NGF e modula dopamina e serotonina.',
    uses: 'Foco, memória, neuroproteção e recuperação neural.',
    cautions: 'Solução intranasal é comum. Efeito agudo; refrigerar após reconstituir.'
  },
  Pinealon: {
    mechanism:
      'Peptídeo curto que atravessa a membrana e regula a expressão gênica neuronal (neuroprotetor).',
    uses: 'Memória, proteção neuronal e estresse oxidativo.',
    cautions: 'Evidência humana limitada; usado em séries curtas.'
  },
  KPV: {
    mechanism:
      'Tripeptídeo derivado do α-MSH com ação anti-inflamatória (via NF-κB) sistêmica e intestinal.',
    uses: 'Inflamação, saúde intestinal e pele.',
    cautions: 'Também usado por via oral. Bem tolerado nos relatos.'
  },
  'ARA-290 (Cibinetida)': {
    mechanism:
      'Ativa o receptor inato de reparo tecidual da eritropoetina, sem efeito hematopoiético.',
    uses: 'Reparo tecidual e dor neuropática (ex.: sarcoidose).',
    cautions: 'Em investigação; não eleva hematócrito como a EPO.'
  },
  'Thymosin Alpha-1': {
    mechanism:
      'Modula células T e a resposta imune inata/adaptativa, equilibrando inflamação.',
    uses: 'Função imune; adjuvante em infecções e imunossupressão em alguns países.',
    cautions: 'Aprovado em vários países. Ciclos conforme objetivo imunológico.'
  },
  DSIP: {
    mechanism:
      'Neuropeptídeo que modula o sono de ondas lentas e o eixo do estresse (cortisol).',
    uses: 'Sono, estresse e regulação hormonal.',
    cautions: 'Resposta variável entre pessoas. Aplicar antes de dormir.'
  },
  'PT-141 (Bremelanotida)': {
    mechanism:
      'Agonista de receptores de melanocortina (MC4R) no SNC, disparando excitação sexual.',
    uses: 'Libido e disfunção sexual em homens e mulheres.',
    cautions: 'Náusea, rubor e leve aumento de pressão são comuns. Uso pontual.'
  },
  'Melanotan II': {
    mechanism:
      'Análogo do α-MSH que estimula melanócitos (pigmentação) e receptores de melanocortina (libido).',
    uses: 'Bronzeamento e libido.',
    cautions:
      'Náusea e escurecimento de pintas possíveis; acompanhar a pele/dermatologista é prudente.'
  },
  'Kisspeptina-10': {
    mechanism:
      'Estimula neurônios de GnRH, aumentando LH/FSH e, por consequência, testosterona/estradiol.',
    uses: 'Eixo reprodutivo, fertilidade e função hormonal.',
    cautions: 'Ação curta e pulsátil. Em investigação para fertilidade.'
  },
  Gonadorelina: {
    mechanism:
      'Análogo de GnRH que estimula a hipófise a liberar LH e FSH de forma pulsátil.',
    uses: 'Manutenção do eixo hormonal e função testicular.',
    cautions: 'Precisa de administração pulsátil; uso contínuo dessensibiliza.'
  },
  Humanina: {
    mechanism:
      'Peptídeo mitocondrial citoprotetor que inibe apoptose e apoia o metabolismo.',
    uses: 'Citoproteção, metabolismo e longevidade.',
    cautions: 'Pesquisa inicial; dados humanos escassos.'
  },
  'Follistatina 344': {
    mechanism:
      'Liga-se e inibe a miostatina, liberando a via de crescimento muscular.',
    uses: 'Interesse em massa e recuperação muscular.',
    cautions:
      'Inibir miostatina cronicamente tem riscos pouco conhecidos; usar em ciclos curtos.'
  }
}
