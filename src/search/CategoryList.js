import React, { Component}  from 'react';

class CategoryList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ul className={"category-list"}>
                {this.props.categories.map((category) => {
                    return (
                        <li>
                            <input type="radio" name={"type"} value={category} onClick={this.props.click} />
                            <span>{category.split('_').join(' ')}</span>
                        </li>
                    );
                })}
            </ul>
        );
    }
}

export default CategoryList;