const CARD_DOMAINS_ES = {
  plat:"Plataforma", gw:"API Gateway", ops:"APIOps", ai:"AI Gateway", ev:"Event Gateway",
  id:"Identity", portal:"Dev Portal", cat:"Catalog", meter:"Metering", obs:"Observabilidad", org:"Organizaciones"
};
// Mismo orden que CARDS: [titular, pregunta, puntos, trampa]
const CARDS_ES = [
["Modo híbrido","¿Quién opera qué en el modo híbrido de Konnect?",["Kong aloja el plano de control: configuración, UI, APIs y analítica","Tú operas los planos de datos en tu infraestructura","Los planos de datos procesan el tráfico y ejecutan los plugins"],"El plano de control nunca procesa tráfico de clientes."],
["Caída del plano de control","El plano de control no responde durante 2 horas. ¿Qué pasa con el tráfico?",["Los planos de datos siguen operando con la última configuración en caché","Los cambios llegan cuando se recupera la conexión","La telemetría queda en búfer y se envía después"],"Un nodo nuevo que nunca se conectó no tiene nada que servir."],
["Seguridad entre CP y DP","¿Cómo confían entre sí el plano de control y el plano de datos?",["mTLS en cada conexión","Konnect genera el certificado del DP o subes el tuyo","Conexión saliente por el puerto 443 desde el plano de datos"],"No hay contraseñas compartidas ni flujo OAuth entre planos."],
["Opciones de despliegue","Nombra las tres formas de operar planos de datos con Konnect.",["Híbrido autoadministrado: tus VMs, Kubernetes o Docker","Dedicated Cloud Gateways: Kong los opera en la nube y región que elijas","Serverless gateways: administrados por Kong, el arranque más rápido para desarrollo"],"¿Red privada hacia una VPC y capacidad dedicada? Dedicated Cloud Gateways."],
["Control plane groups","Varios equipos y un solo conjunto de planos de datos. ¿Qué usas?",["Cada equipo administra un plano de control miembro","Los planos de datos se conectan al grupo, no a los miembros","El grupo combina las configuraciones de los miembros"],"Entidades en conflicto entre miembros generan errores."],
["Geos","¿Qué implica elegir una geo en Konnect?",["La configuración y los datos quedan en esa región","Los recursos no se comparten entre geos","La geo se cambia desde la UI de Konnect"],"Las geos existen por residencia de datos."],
["Compatibilidad de versiones","La configuración usa un campo que la versión del plano de datos no conoce. ¿Qué pasa?",["Konnect marca el nodo como incompatible o compatible con limitaciones","Actualiza el plano de datos o quita la configuración no soportada"],"Konnect nunca actualiza planos de datos por su cuenta."],
["Valor de negocio","Explica el valor de Konnect a un CIO en una línea.",["Una sola capa de control para tráfico de APIs, IA y eventos","Seguridad, gobierno y analítica consistentes","Menos carga operativa, con runtimes desplegados donde se necesiten"],"Evita afirmaciones como latencia mínima garantizada."],
["Kong Operator","¿Cómo administras gateways y entidades de Konnect como recursos de Kubernetes?",["Kong Operator con CRDs","KonnectAPIAuthConfiguration guarda las credenciales de Konnect","Es la evolución de Gateway Operator e Ingress Controller"],"decK es una CLI, no un controlador de Kubernetes."],

["Service vs Route","¿Qué entidad hace la coincidencia de solicitudes y cuál apunta al backend?",["Route: hosts, paths, métodos y headers para coincidir","Gateway Service: protocolo, host, puerto y path del backend","La Route envía el tráfico coincidente a su Service"],"Las reglas de coincidencia viven en la Route, nunca en el Service."],
["Upstreams y Targets","¿Cómo balanceas tráfico entre 3 réplicas con pesos?",["Crea un Upstream (host virtual con balanceador)","Agrega un Target por réplica con su peso","Configura el host del Service con el nombre del Upstream"],"El algoritmo por defecto es round-robin."],
["Algoritmos de balanceo","¿Qué algoritmos soportan los Upstreams?",["round-robin (por defecto)","consistent-hashing","least-connections","latency"],"geo-proximity o dns-priority son opciones falsas."],
["Health checks activos","¿Cómo funcionan los health checks activos?",["Kong envía sondeos a cada Target en un path e intervalo","Marca los Targets como sanos o no sanos según las respuestas","Reincorpora automáticamente los Targets recuperados"],"Activo = sondeos sintéticos."],
["Health checks pasivos","¿Qué es un circuit breaker en Kong?",["Los checks pasivos observan el tráfico real","Demasiados errores o timeouts marcan el Target como no sano","El tráfico pasa a los Targets sanos"],"Con solo checks pasivos un Target nunca vuelve a estar sano."],
["Precedencia de plugins","¿Qué instancia de plugin gana cuando varias aplican?",["Gana la más específica y solo corre una","Consumer+Route+Service está arriba","Route+Service le gana a Consumer solo","Global siempre es la última"],"Los límites nunca se suman."],
["Ejercicio de precedencia","Global 5/min, Route 50/min, Consumer+Route 500/min. ¿Dos clientes?",["El Consumer con instancia propia obtiene 500","Cualquier otro Consumer en esa Route obtiene 50","Las solicitudes en otras rutas obtienen 5"],"Lee el alcance antes que el número."],
["Fases de plugins","Nombra las fases principales en orden.",["certificate, rewrite, access","header_filter, body_filter, log"],"En rewrite solo corren plugins globales."],
["Fase log","¿Dónde debe hacer su trabajo un plugin de logging?",["En la fase log, después de enviar la respuesta","No agrega latencia al cliente"],"Trabajo pesado en access agrega latencia a cada llamada."],
["Prioridad estática","¿Por qué key-auth corre antes que rate-limiting?",["Cada plugin tiene una prioridad estática","La prioridad más alta corre primero dentro de una fase","La autenticación identifica al Consumer antes de aplicar límites"],"No es orden alfabético ni de creación."],
["Orden dinámico","¿Cómo obligas a request-transformer a correr antes de key-auth?",["ordering.before / ordering.after en el plugin","Aplica a la fase access","Funcionalidad Enterprise"],"No puedes editar la prioridad de los plugins incluidos."],
["strip_path","Route /orders, strip_path true, path del Service /v1. ¿Solicitud /orders/42?",["El upstream recibe /v1/42","strip_path elimina el prefijo coincidente","El resto del path se agrega al path del Service"],"Con strip_path false sería /v1/orders/42."],
["Paths con regex","¿Cómo se escribe un path con regex en el router tradicional?",["Antepón ~ al path","Los demás paths coinciden por prefijo"],"No existe un flag regex: true."],
["preserve_host","¿Qué cambia preserve_host: true?",["El upstream recibe el header Host original del cliente","Por defecto se envía el host del Service"],"No valida el Host."],
["Expressions router","¿Para qué usar el expressions router?",["Operadores lógicos && y || sobre campos http","Prioridad explícita por Route","Coincidencias complejas en una sola regla"],"Sigue necesitando Services y planos de datos."],
["Códigos de estado","¿Falta la llave, ACL niega, límite excedido?",["401 credenciales ausentes o inválidas","403 autenticado pero sin permiso (ACL)","429 límite de tasa excedido"],"503 es un problema del upstream, no de una política."],
["Consumer Groups","¿Niveles Gold, Silver y Bronze para cientos de Consumers?",["Un Consumer Group por nivel","rate-limiting-advanced con alcance en cada grupo","Mueve Consumers entre grupos para cambiar de nivel"],"Un plugin por Consumer no escala."],
["SNIs y certificados","¿Cómo elige Kong el certificado TLS que presenta?",["Las entidades SNI asocian hostnames con Certificates","Primero coincidencia exacta, luego comodines","Si nada coincide usa el certificado por defecto"],"SNI es de TLS, no de hosts del upstream."],
["Vaults","¿Cómo sacas los secretos de la configuración de plugins?",["Usa un Vault y una referencia como {vault://aws/key}","Backends: AWS, GCP, Azure, HashiCorp, Konnect Config Store, variables de entorno"],"Se resuelven en tiempo de ejecución en el plano de datos."],

["sync vs apply","¿Qué comando de decK borra lo que falta en el archivo?",["deck gateway sync: estado declarativo completo, borra lo que sobra","deck gateway apply: solo crea y actualiza"],"Trampa clásica del examen. sync borra."],
["diff","¿Cómo revisas cambios de forma segura?",["deck gateway diff muestra creaciones, actualizaciones y borrados","Publícalo en el pull request antes del merge"],"diff nunca cambia nada."],
["dump","¿Cómo exportas la configuración en vivo a YAML?",["deck gateway dump -o kong.yaml","Respaldos, migraciones y arranque de GitOps"],"dump lee, sync escribe."],
["openapi2kong","¿De especificación OpenAPI a configuración de Kong?",["deck file openapi2kong -s openapi.yaml","Genera Services y Routes","Luego patch, add-plugins y merge"],"kong2kic es para manifiestos de Kubernetes."],
["select_tags","¿El equipo A no debe tocar entidades del equipo B en el mismo plano de control?",["_info.select_tags en el archivo de estado","sync, diff y dump solo ven las entidades con esas etiquetas"],"No hacen falta organizaciones separadas."],
["Flags de Konnect","¿Cómo apuntas decK a un plano de control de Konnect?",["--konnect-token","--konnect-control-plane-name","--konnect-addr para el endpoint regional"],"--workspace es para Enterprise autoadministrado."],
["PAT vs cuenta de sistema","¿Qué token usa un pipeline de CI?",["Token de cuenta de sistema, limitado por roles","No depende de una persona y sobrevive a cambios de personal","Los PAT actúan como el usuario y mueren con él"],"Nunca pongas un token personal en CI."],
["lint","¿Cómo aplicas reglas de gobierno a los archivos en CI?",["deck file lint con un ruleset","Corre sin conexión, antes de cualquier despliegue"],"lint revisa reglas, ping revisa conectividad."],
["Pipeline APIOps","Ordena los pasos de un pipeline APIOps.",["openapi2kong","patch / add-plugins","merge","diff en el PR","sync después del merge"],"sync va al final, después de la revisión."],
["Terraform","¿Qué provider administra Konnect como código?",["kong/konnect","Planos de control, entidades, portales y equipos"],"No existe un provider hashicorp/kong para Konnect."],

["AI Proxy","¿Un proveedor de LLM detrás de una API estándar?",["AI Proxy traduce las solicitudes al proveedor elegido","Inyecta las credenciales del proveedor en el gateway","Las aplicaciones nunca guardan llaves del proveedor"],"Un solo destino."],
["AI Proxy Advanced","¿Varios modelos con balanceo y failover?",["Múltiples destinos","round-robin, lowest-latency, lowest-usage, consistent-hashing, priority, semantic","Respaldo ante errores o 429"],"El ruteo semantic elige modelo según el significado del prompt."],
["Prompt Guard vs Semantic Guard","¿Reglas regex o bloqueo por significado?",["AI Prompt Guard: listas regex de permitir y negar","AI Semantic Prompt Guard: embeddings, detecta reformulaciones"],"Un jailbreak reformulado evade regex, no la semántica."],
["Semantic Cache","¿Qué necesita AI Semantic Cache?",["Un modelo de embeddings","Una base de datos vectorial como Redis","Devuelve respuestas en caché para prompts similares"],"No es una caché HTTP byte a byte."],
["Límites por tokens","¿Cómo limitas el gasto de LLM por equipo según tokens?",["AI Rate Limiting Advanced","Cuenta tokens de prompt y respuesta, o costo","Por proveedor y ventana de tiempo"],"rate-limiting normal solo cuenta solicitudes."],
["Decorator vs Template","¿Inyectar un mensaje de sistema o permitir solo prompts aprobados?",["AI Prompt Decorator: agrega mensajes al inicio o al final","AI Prompt Template: plantillas con nombre y {{variables}}"],"Decorator agrega, Template restringe."],
["AI Sanitizer","¿Cómo quitas PII antes de que el prompt salga de la empresa?",["AI Sanitizer oculta o anonimiza PII","Puede restaurar los valores en la respuesta"],"Prompt Guard bloquea, Sanitizer reescribe."],
["MCP","¿Cómo dejas que agentes usen APIs REST existentes como herramientas?",["AI MCP Proxy expone y gobierna el tráfico MCP","Kong maneja autenticación y políticas para los agentes"],"MCP es de herramientas para agentes, no de ruteo de modelos."],
["Observabilidad de IA","¿Dónde ves tokens y costo por modelo?",["Konnect Analytics con métricas de IA","Las recolectan los planos de datos"],"No está en el Dev Portal ni en Catalog."],

["Event Gateway","¿Qué es Kong Event Gateway?",["Proxy que entiende el protocolo de Kafka","Aplica seguridad y gobierno al tráfico de Kafka","Los clientes usan sus clientes Kafka estándar"],"No reemplaza a los brokers."],
["Virtual clusters","¿Muchos equipos, un clúster Kafka físico y espacios aislados?",["Virtual clusters sobre un backend cluster","Espacios de tópicos y autenticación separados por equipo"],"Backend cluster = el Kafka real."],
["Políticas de eventos","¿Cómo cifras un campo sensible sin tocar a los productores?",["Política de cifrado en Event Gateway","Registros o campos cifrados en tránsito"],"AI Sanitizer es para tráfico HTTP de LLM."],

["Kong Identity","¿Qué es Kong Identity?",["Servidor de autorización OAuth 2.0 alojado en Konnect","Auth servers, clientes, scopes y claims","Principalmente máquina a máquina"],"No es el SSO de empleados para Konnect."],
["Grant M2M","Proceso backend sin usuario presente. ¿Qué grant usa?",["Client credentials","El gateway valida el token con OpenID Connect"],"Implicit y password son grants heredados."],
["Scopes","¿Para qué se definen scopes?",["Codifican lo que permite un token","El gateway exige scopes por Route o Service"],"Los scopes son permisos, no límites de tasa."],

["Dev Portal","¿Qué hace el Dev Portal?",["Publica APIs con especificación y documentación","Registro y aprobación de desarrolladores","Aplicaciones para obtener credenciales"],"La documentación sale de la especificación OpenAPI adjunta."],
["Estrategias de autenticación","¿Cómo se autentican las aplicaciones del portal?",["Key auth","OpenID Connect","DCR crea clientes en Okta, Auth0, Azure o Curity"],"No hay basic auth ni SAML para clientes de API."],
["Visibilidad","¿API solo para socios en el portal?",["Visibilidad privada","Aprobación manual de desarrolladores","SSO de desarrolladores con OIDC o SAML"],"Ocultar el enlace no es control de acceso."],

["Catalog","¿Qué es Konnect Catalog?",["Inventario de servicios y APIs con responsables","Integraciones: GitHub, GitLab, PagerDuty, Datadog","Scorecards que miden estándares"],"Usa scorecards para encontrar servicios sin especificación o sin responsable."],

["Metering & Billing","¿Cobrar a clientes por llamada de API o por token de IA?",["Los meters agregan eventos de uso: count, sum, unique","Planes y entitlements definen los niveles","Facturación con Stripe y similares"],"Rate limiting pone tope al uso, metering lo cobra."],

["Debugger","¿Qué fase o plugin está lento en una Route?",["Sesión de active tracing / Debugger en el plano de datos","Spans por solicitud con tiempos de cada plugin"],"Analytics muestra agregados, Debugger muestra solicitudes individuales."],
["Latencia separada","¿Latencia de upstream alta y latencia de Kong baja?",["El backend está lento","La latencia de Kong es trabajo del gateway, sobre todo plugins"],"No culpes al gateway por el tiempo del upstream."],
["Explorer vs Dashboards","¿Consulta puntual por Route y Consumer?",["Explorer para análisis puntual","Dashboards y reportes para guardar y compartir"],"Los datos vienen de la telemetría de los planos de datos."],
["Exportar métricas","¿Prometheus u OpenTelemetry?",["Plugin Prometheus: métricas para scraping","Plugin OpenTelemetry: trazas y logs por OTLP"],"Correlation ID solo agrega un header."],
["Out of sync","Un nodo aparece fuera de sincronía. ¿Primer paso?",["Revisar los logs del plano de datos","Revisar conectividad saliente hacia CP y endpoints de telemetría","Revisar certificados y compatibilidad de versión"],"Empieza por el nodo, no por el portal."],

["Equipos y roles","¿Un contratista edita solo un plano de control?",["Rol con alcance en ese plano de control","Asignarlo mediante un equipo para escalar","Mínimo privilegio"],"Nunca compartas tokens de administrador."],
["SSO y auditoría de la organización","¿Login corporativo e historial de cambios al SIEM?",["SSO de Konnect con OIDC o SAML, grupos del IdP mapeados a equipos","Audit logs hacia un webhook del SIEM"],"Organization Admin tiene acceso total. Mantenlo pequeño."]
];
