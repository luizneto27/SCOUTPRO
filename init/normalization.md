O capítulo 15 trata da **normalização em bancos de dados relacionais**, explicando por que nem toda forma de organizar os dados em tabelas é adequada. A ideia central é mostrar que um banco de dados bem projetado não depende apenas de criar tabelas, mas de organizar os atributos de modo que as informações fiquem claras, consistentes e sem repetições desnecessárias.

No início do capítulo, os autores explicam que, ao montar um esquema relacional, é preciso pensar no significado dos dados. Cada tabela deve representar uma ideia bem definida do mundo real, como funcionário, departamento, projeto ou relacionamento entre essas entidades. Quando uma tabela mistura informações de coisas diferentes, o sentido dos dados fica confuso e o banco passa a ficar mais difícil de consultar, atualizar e manter.

Um dos principais problemas apresentados é a **redundância**. Ela acontece quando a mesma informação aparece repetida em várias linhas. À primeira vista, isso pode parecer apenas desperdício de espaço, mas o problema é mais sério: a redundância pode causar erros durante as atualizações. Por exemplo, se o nome de um departamento aparece repetido em várias linhas de funcionários, qualquer mudança nesse nome precisa ser feita em todos os lugares. Se uma linha for esquecida, o banco passa a guardar informações contraditórias.

A partir disso, o capítulo discute as chamadas **anomalias de atualização**, que são problemas causados por relações mal projetadas. A anomalia de inserção ocorre quando não é possível cadastrar uma informação sem cadastrar outra junto. A anomalia de exclusão ocorre quando, ao apagar uma linha, perde-se também uma informação importante que deveria continuar no banco. Já a anomalia de modificação acontece quando uma alteração precisa ser repetida em várias linhas para que os dados permaneçam coerentes.

Outro ponto importante é o uso de valores **NULL**. O capítulo não afirma que NULL nunca deve ser usado, mas alerta que seu uso excessivo prejudica o projeto do banco. Isso porque um valor nulo pode significar várias coisas: que a informação não existe, que ainda não foi registrada ou que é desconhecida. Essa ambiguidade pode dificultar consultas, junções e operações de agregação.

O texto também apresenta o problema das **tuplas falsas**. Isso acontece quando tabelas são divididas de forma inadequada e, ao serem juntadas novamente por meio de uma operação de junção, produzem linhas que não correspondem a fatos reais. Esse problema mostra que decompor tabelas não é simplesmente “quebrar em partes menores”; é preciso garantir que a decomposição preserve corretamente a informação original.

Depois dessas diretrizes iniciais, o capítulo introduz o conceito de **dependência funcional**, que é a base da normalização. Uma dependência funcional ocorre quando um atributo, ou conjunto de atributos, determina outro. Por exemplo, se o CPF de um funcionário determina seu nome, então existe uma dependência funcional entre CPF e nome. Esse conceito é importante porque permite analisar formalmente se os atributos de uma tabela estão no lugar correto.

A normalização, então, aparece como um processo de análise e melhoria das tabelas. A proposta é verificar se cada relação atende a certas regras, chamadas **formas normais**. Quando uma relação não atende a uma forma normal, ela pode ser decomposta em relações menores e mais adequadas. O objetivo não é complicar o banco, mas evitar redundâncias, inconsistências e dificuldades futuras de manutenção.

A **Primeira Forma Normal**, ou **1FN**, exige que os valores dos atributos sejam atômicos, ou seja, simples e indivisíveis. Uma tabela viola a 1FN quando possui, por exemplo, um campo com vários valores dentro da mesma célula. Nesses casos, o correto é separar esses valores em outra tabela, criando uma estrutura mais organizada.

A **Segunda Forma Normal**, ou **2FN**, trata das dependências parciais. Ela se aplica principalmente quando a chave primária é composta por mais de um atributo. Uma tabela está em 2FN quando todos os atributos não chave dependem da chave inteira, e não apenas de uma parte dela. Se um atributo depende só de uma parte da chave, isso indica que ele provavelmente deveria estar em outra relação.

A **Terceira Forma Normal**, ou **3FN**, busca eliminar dependências transitivas. Isso acontece quando um atributo não chave depende de outro atributo não chave. Em um bom projeto, os atributos devem depender diretamente da chave da relação, e não de atributos intermediários. A 3FN é bastante importante na prática porque ajuda a separar melhor os fatos representados no banco.

O capítulo também apresenta definições mais gerais da 2FN e da 3FN, considerando não apenas a chave primária, mas todas as chaves candidatas. Isso torna a análise mais completa, pois uma relação pode ter mais de uma forma possível de identificar suas tuplas de maneira única.

Em seguida, é apresentada a **Forma Normal de Boyce-Codd**, conhecida como **FNBC**. Ela é parecida com a 3FN, mas mais rigorosa. A ideia principal é que todo atributo ou conjunto de atributos que determina outro deve ser uma superchave. Na prática, a FNBC corrige alguns casos que ainda poderiam gerar problemas mesmo em relações que já estão na 3FN.

O capítulo também aborda a **Quarta Forma Normal**, ou **4FN**, relacionada às dependências multivaloradas. Esse tipo de problema aparece quando uma tabela mistura dois conjuntos independentes de valores multivalorados. Isso pode gerar muitas combinações repetidas e desnecessárias. A solução é decompor a relação em tabelas separadas, cada uma representando um fato de forma mais limpa.

Por fim, o texto apresenta a **Quinta Forma Normal**, ou **5FN**, ligada às dependências de junção. Essa forma normal trata de casos mais complexos, em que uma relação só pode ser decomposta corretamente em três ou mais relações. O próprio capítulo indica que essa forma normal tem maior importância teórica, pois é mais difícil de identificar e menos comum em projetos práticos.

De modo geral, o capítulo mostra que a normalização é uma etapa essencial no projeto de bancos de dados relacionais. Ela ajuda a construir esquemas mais claros, coerentes e fáceis de manter. Embora existam várias formas normais, na prática os projetos costumam buscar principalmente a **3FN** ou a **FNBC**, pois elas já resolvem a maior parte dos problemas de redundância e anomalias encontrados em bancos de dados reais. 


