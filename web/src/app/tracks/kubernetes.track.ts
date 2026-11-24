import { CourseModule, createModule as m } from '../course-module.model';

export const KUBERNETES_MODULES: CourseModule[] = [
  m(0, 'Kubernetes — fundamentos', 'Kubernetes I', 'Integración', '4 h', '#475569',
    'El orquestador de contenedores estándar de la industria. Pods, deployments y services explicados desde cero.',['Pod, ReplicaSet, Deployment', 'Service (ClusterIP, NodePort, LoadBalancer)', 'ConfigMaps y Secrets', 'kubectl esencial', 'Namespaces', 'StatefulSets, DaemonSets, Jobs y CronJobs', 'Persistent Volumes, PVCs y StorageClasses', 'Clúster local con Minikube: perfiles, addons e Ingress', 'Arquitectura de Kubernetes: plano de control, nodos y el ciclo de reconciliación', 'Scheduling en Kubernetes: requests, limits, afinidad, taints y tolerations'],
    [
      'Crea un cluster local con kind o minikube y verifica con kubectl get nodes',
      'Despliega tu propia app con un Deployment de 3 réplicas y verifica con kubectl get pods',
      'Expón el Deployment con un Service tipo ClusterIP y accede a él con kubectl port-forward',
      'Crea un ConfigMap y un Secret, e inyéctalos como variables de entorno en el Pod',
      'Elimina un Pod manualmente y observa cómo el ReplicaSet lo recrea automáticamente',
    ],
    ['¿Qué diferencia hay entre un Pod, un ReplicaSet y un Deployment — por qué necesitas los tres conceptos?', '¿Por qué guardas información sensible en un Secret y no en un ConfigMap?'],
    ['Kubernetes'],
    'Aplicación desplegada en un cluster Kubernetes local (kind/minikube) con su Service expuesto.'),
  m(1, 'Kubernetes avanzado — Helm e Ingress', 'Kubernetes II', 'Integración', '3 h 30 min', '#475569',
    'Empaqueta tus manifiestos como charts reutilizables y expón tu cluster a internet de forma controlada.',['Helm charts y values', 'Ingress Controllers y reglas de enrutamiento', 'HorizontalPodAutoscaler', 'Probes de liveness y readiness', 'RBAC en Kubernetes', 'Service Mesh — Istio, Linkerd, Envoy y mTLS', 'Estrategias de despliegue — Recreate vs RollingUpdate', 'Políticas en Kubernetes: NetworkPolicy y Pod Security Admission'],
    [
      'Convierte tus manifiestos YAML del módulo anterior en un Helm chart con values.yaml parametrizable',
      'Instala un Ingress Controller en tu cluster local y crea una regla que enrute un dominio a tu Service',
      'Configura un HorizontalPodAutoscaler que escale tu Deployment según uso de CPU',
      'Agrega probes de liveness y readiness a tu Deployment y verifica con kubectl describe pod que Kubernetes las usa',
      'Crea un Role y un RoleBinding que limiten qué puede hacer una cuenta de servicio específica',
    ],
    ['¿Qué diferencia hay entre un readiness probe y un liveness probe?', '¿Qué ventaja real da Helm sobre aplicar YAMLs sueltos con kubectl apply?'],
    ['Helm', 'Kubernetes'],
    'Helm chart propio con autoscaling e Ingress configurado.'),
  m(2, 'DevOps Master: GitOps, Service Mesh y DevSecOps', 'DevOps Master', 'Experto', '12 h', '#475569',
    'Opera una plataforma con Docker/Compose avanzado, Kubernetes extensible, Helm, Ansible, GitOps, Service Mesh, seguridad continua y métricas DORA.',['Docker y Compose avanzados', 'Kubernetes extensible y Helm avanzado', 'Service Mesh con Istio o Linkerd', 'GitOps con Argo CD y Flux', 'Ansible, inventarios, roles y Vault', 'DevSecOps y métricas DORA'],
    ['Optimiza una imagen multi-stage', 'Crea CRD y política', 'Prueba un chart', 'Canary con mesh', 'Reconcilia con GitOps', 'Mide las cuatro métricas DORA'],
    ['¿Por qué GitOps no elimina CI?', '¿Cuándo un service mesh cuesta más de lo que aporta?'], ['Kubernetes','Helm','Argo CD','Istio','Ansible','Trivy'], 'Plataforma GitOps segura con mesh, automatización, policy gates y métricas de entrega.'),
];
