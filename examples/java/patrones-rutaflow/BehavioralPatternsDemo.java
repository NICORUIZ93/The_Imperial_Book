import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class BehavioralPatternsDemo {
    interface Observer {
        void update(String state);
    }

    static final class Delivery {
        private final List<Observer> observers = new ArrayList<>();
        void subscribe(Observer observer) { observers.add(observer); }
        void publish(String state) {
            for (Observer observer : List.copyOf(observers)) observer.update(state);
        }
    }

    interface PriceStrategy {
        int cents(int kilometers);
    }

    static final class PriceContext {
        private final PriceStrategy strategy;
        PriceContext(PriceStrategy strategy) { this.strategy = strategy; }
        int quote(int kilometers) { return strategy.cents(kilometers); }
    }

    interface Command {
        void execute();
    }

    static final class SetStateCommand implements Command {
        private final Consumer<String> setter;
        private final String state;
        SetStateCommand(Consumer<String> setter, String state) {
            this.setter = setter;
            this.state = state;
        }
        public void execute() { setter.accept(state); }
    }

    abstract static class DeliveryWorkflow {
        final String process(String code) {
            return validate(code) + ">" + store(code) + ">" + notifyCustomer(code);
        }
        abstract String store(String code);
        String validate(String code) {
            if (code == null || code.isBlank()) throw new IllegalArgumentException("codigo requerido");
            return "validado";
        }
        String notifyCustomer(String code) { return "notificado"; }
    }

    static final class DatabaseWorkflow extends DeliveryWorkflow {
        String store(String code) { return "db:" + code; }
    }

    interface Handler {
        String handle(String event);
    }

    static final class RetryHandler implements Handler {
        private final Handler next;
        RetryHandler(Handler next) { this.next = next; }
        public String handle(String event) {
            return event.equals("timeout") ? "reintento" : next.handle(event);
        }
    }

    static final class DefaultHandler implements Handler {
        public String handle(String event) { return "rechazado:" + event; }
    }

    enum Status { CREATED, IN_TRANSIT, DELIVERED }

    static final class DeliveryState {
        private Status status = Status.CREATED;
        void dispatch() {
            if (status != Status.CREATED) throw new IllegalStateException("transicion invalida");
            status = Status.IN_TRANSIT;
        }
        String current() { return status.name(); }
    }

    static final class DeliveryIterator {
        private final List<String> history;
        private int position;
        DeliveryIterator(List<String> history) { this.history = List.copyOf(history); }
        boolean hasNext() { return position < history.size(); }
        String next() { return history.get(position++); }
    }

    static final class OperationsMediator {
        private String state = "CREATED";
        String customerView() { return "cliente:" + state; }
        void updateFromWarehouse(String newState) { state = newState; }
    }

    static final class Draft {
        private final String address;
        Draft(String address) { this.address = address; }
        String address() { return address; }
    }

    static final class AddressEditor {
        private String address;
        void change(String value) { address = value; }
        Draft save() { return new Draft(address); }
        void restore(Draft draft) { address = draft.address(); }
        String address() { return address; }
    }

    interface EventVisitor {
        String visit(LocationEvent event);
        String visit(DelayEvent event);
    }

    interface Event {
        String accept(EventVisitor visitor);
    }

    record LocationEvent(String zone) implements Event {
        public String accept(EventVisitor visitor) { return visitor.visit(this); }
    }

    record DelayEvent(int minutes) implements Event {
        public String accept(EventVisitor visitor) { return visitor.visit(this); }
    }

    static final class AuditVisitor implements EventVisitor {
        public String visit(LocationEvent event) { return "zona:" + event.zone(); }
        public String visit(DelayEvent event) { return "demora:" + event.minutes(); }
    }

    public static void main(String[] args) {
        Delivery delivery = new Delivery();
        delivery.subscribe(state -> System.out.println("observer=" + state));
        delivery.publish("EN_CAMINO");
        System.out.println("strategy=" + new PriceContext(km -> 500 + 100 * km).quote(10));
        String[] state = {"CREATED"};
        new SetStateCommand(value -> state[0] = value, "CANCELLED").execute();
        System.out.println("command=" + state[0]);
        System.out.println("template=" + new DatabaseWorkflow().process("RF-1"));
        System.out.println("chain=" + new RetryHandler(new DefaultHandler()).handle("timeout"));
        DeliveryState deliveryState = new DeliveryState();
        deliveryState.dispatch();
        System.out.println("state=" + deliveryState.current());
        DeliveryIterator iterator = new DeliveryIterator(List.of("CREATED", "IN_TRANSIT"));
        System.out.println("iterator=" + iterator.next() + "," + iterator.next());
        OperationsMediator mediator = new OperationsMediator();
        mediator.updateFromWarehouse("DELIVERED");
        System.out.println("mediator=" + mediator.customerView());
        AddressEditor editor = new AddressEditor();
        editor.change("Calle 1");
        Draft checkpoint = editor.save();
        editor.change("Calle 2");
        editor.restore(checkpoint);
        System.out.println("memento=" + editor.address());
        AuditVisitor visitor = new AuditVisitor();
        System.out.println("visitor=" + new LocationEvent("NORTE").accept(visitor) + ","
                + new DelayEvent(15).accept(visitor));
    }
}
