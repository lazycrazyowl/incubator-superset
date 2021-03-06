import { Provider } from 'react-redux';
import React from 'react';
import { mount } from 'enzyme';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import BackgroundStyleDropdown from '../../../../../src/dashboard/components/menu/BackgroundStyleDropdown';
import Column from '../../../../../src/dashboard/components/gridComponents/Column';
import DashboardComponent from '../../../../../src/dashboard/containers/DashboardComponent';
import DeleteComponentButton from '../../../../../src/dashboard/components/DeleteComponentButton';
import DragDroppable from '../../../../../src/dashboard/components/dnd/DragDroppable';
import HoverMenu from '../../../../../src/dashboard/components/menu/HoverMenu';
import IconButton from '../../../../../src/dashboard/components/IconButton';
import ResizableContainer from '../../../../../src/dashboard/components/resizable/ResizableContainer';
import WithPopoverMenu from '../../../../../src/dashboard/components/menu/WithPopoverMenu';

import { mockStore } from '../../fixtures/mockStore';
import { dashboardLayout as mockLayout } from '../../fixtures/mockDashboardLayout';
import WithDragDropContext from '../../helpers/WithDragDropContext';

describe('Column', () => {
  const columnWithoutChildren = {
    ...mockLayout.present.COLUMN_ID,
    children: [],
  };
  const props = {
    id: 'COLUMN_ID',
    parentId: 'ROW_ID',
    component: mockLayout.present.COLUMN_ID,
    parentComponent: mockLayout.present.ROW_ID,
    index: 0,
    depth: 2,
    editMode: false,
    availableColumnCount: 12,
    minColumnWidth: 2,
    columnWidth: 50,
    occupiedColumnCount: 6,
    onResizeStart() {},
    onResize() {},
    onResizeStop() {},
    handleComponentDrop() {},
    deleteComponent() {},
    updateComponents() {},
  };

  function setup(overrideProps) {
    // We have to wrap provide DragDropContext for the underlying DragDroppable
    // otherwise we cannot assert on DragDroppable children
    const wrapper = mount(
      <Provider store={mockStore}>
        <WithDragDropContext>
          <Column {...props} {...overrideProps} />
        </WithDragDropContext>
      </Provider>,
    );
    return wrapper;
  }

  it('should render a DragDroppable', () => {
    // don't count child DragDroppables
    const wrapper = setup({ component: columnWithoutChildren });
    expect(wrapper.find(DragDroppable)).to.have.length(1);
  });

  it('should render a WithPopoverMenu', () => {
    // don't count child DragDroppables
    const wrapper = setup({ component: columnWithoutChildren });
    expect(wrapper.find(WithPopoverMenu)).to.have.length(1);
  });

  it('should render a ResizableContainer', () => {
    // don't count child DragDroppables
    const wrapper = setup({ component: columnWithoutChildren });
    expect(wrapper.find(ResizableContainer)).to.have.length(1);
  });

  it('should render a HoverMenu in editMode', () => {
    let wrapper = setup({ component: columnWithoutChildren });
    expect(wrapper.find(HoverMenu)).to.have.length(0);

    // we cannot set props on the Row because of the WithDragDropContext wrapper
    wrapper = setup({ component: columnWithoutChildren, editMode: true });
    expect(wrapper.find(HoverMenu)).to.have.length(1);
  });

  it('should render a DeleteComponentButton in editMode', () => {
    let wrapper = setup({ component: columnWithoutChildren });
    expect(wrapper.find(DeleteComponentButton)).to.have.length(0);

    // we cannot set props on the Row because of the WithDragDropContext wrapper
    wrapper = setup({ component: columnWithoutChildren, editMode: true });
    expect(wrapper.find(DeleteComponentButton)).to.have.length(1);
  });

  it('should render a BackgroundStyleDropdown when focused', () => {
    let wrapper = setup({ component: columnWithoutChildren });
    expect(wrapper.find(BackgroundStyleDropdown)).to.have.length(0);

    // we cannot set props on the Row because of the WithDragDropContext wrapper
    wrapper = setup({ component: columnWithoutChildren, editMode: true });
    wrapper
      .find(IconButton)
      .at(1) // first one is delete button
      .simulate('click');

    expect(wrapper.find(BackgroundStyleDropdown)).to.have.length(1);
  });

  it('should call deleteComponent when deleted', () => {
    const deleteComponent = sinon.spy();
    const wrapper = setup({ editMode: true, deleteComponent });
    wrapper.find(DeleteComponentButton).simulate('click');
    expect(deleteComponent.callCount).to.equal(1);
  });

  it('should pass its own width as availableColumnCount to children', () => {
    const wrapper = setup();
    const dashboardComponent = wrapper.find(DashboardComponent).first();
    expect(dashboardComponent.props().availableColumnCount).to.equal(
      props.component.meta.width,
    );
  });

  it('should pass appropriate dimensions to ResizableContainer', () => {
    const wrapper = setup({ component: columnWithoutChildren });
    const columnWidth = columnWithoutChildren.meta.width;
    const resizableProps = wrapper.find(ResizableContainer).props();
    expect(resizableProps.adjustableWidth).to.equal(true);
    expect(resizableProps.adjustableHeight).to.equal(false);
    expect(resizableProps.widthStep).to.equal(props.columnWidth);
    expect(resizableProps.widthMultiple).to.equal(columnWidth);
    expect(resizableProps.minWidthMultiple).to.equal(props.minColumnWidth);
    expect(resizableProps.maxWidthMultiple).to.equal(
      props.availableColumnCount + columnWidth,
    );
  });

  it('should increment the depth of its children', () => {
    const wrapper = setup();
    const dashboardComponent = wrapper.find(DashboardComponent);
    expect(dashboardComponent.props().depth).to.equal(props.depth + 1);
  });
});
